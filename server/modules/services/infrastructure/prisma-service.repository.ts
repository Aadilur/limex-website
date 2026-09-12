import { Prisma, type PrismaClient } from "@prisma/client";

import type { MenuSection } from "../../admin/domain/menu.js";
import {
  ServiceConflictError,
  ServiceNotFoundError,
  ServiceSafetyError,
  type ServiceProfileRow,
  type ServiceProfileStatus,
  type ServiceRepository,
} from "../domain/service.js";
import { normalizeServiceDetail } from "../domain/service.js";
import type { ServiceProfileInput } from "../../../../src/lib/service-types.js";

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function toRow(value: unknown): ServiceProfileRow {
  return value as ServiceProfileRow;
}

function snapshotFromInput(input: ServiceProfileInput) {
  return {
    serviceKey: input.serviceKey ?? "",
    slug: input.slug,
    titleEn: input.titleEn,
    titleBn: input.titleBn,
    descriptionEn: input.descriptionEn,
    descriptionBn: input.descriptionBn,
    detail: input.detail,
  };
}

function currentStatus(status: string, hasDetail: boolean): ServiceProfileStatus {
  if (status === "PUBLISHED") return "DRAFT";
  return hasDetail ? "DRAFT" : "LINK_ONLY";
}

export class PrismaServiceRepository implements ServiceRepository {
  public constructor(private readonly client: PrismaClient) {}

  public findMenuTree(): Promise<MenuSection[]> {
    return this.client.menuSection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        groups: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
              include: {
                links: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    }) as unknown as Promise<MenuSection[]>;
  }

  public async findProfiles(): Promise<ServiceProfileRow[]> {
    const rows = await this.client.serviceProfile.findMany({ orderBy: { updatedAt: "desc" } });
    return rows.map(toRow);
  }

  public async findProfileByMenuItemId(menuItemId: string): Promise<ServiceProfileRow | null> {
    const row = await this.client.serviceProfile.findUnique({ where: { menuItemId } });
    return row ? toRow(row) : null;
  }

  public async findProfileById(id: string): Promise<ServiceProfileRow | null> {
    const row = await this.client.serviceProfile.findUnique({ where: { id } });
    return row ? toRow(row) : null;
  }

  public async findProfileBySlug(slug: string): Promise<ServiceProfileRow | null> {
    const row = await this.client.serviceProfile.findUnique({ where: { slug } });
    return row ? toRow(row) : null;
  }

  public async upsertProfile(menuItemId: string, input: ServiceProfileInput, expectedRevision: number | null, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const menuItem = await transaction.menuItem.findUnique({ where: { id: menuItemId } });
      if (!menuItem) throw new ServiceNotFoundError("The menu service no longer exists. Refresh the service list before saving.");

      const current = await transaction.serviceProfile.findUnique({ where: { menuItemId } });
      const currentRevision = current?.revision ?? 0;
      if (expectedRevision !== null && expectedRevision !== currentRevision) {
        throw new ServiceConflictError();
      }
      if (expectedRevision === null && current) {
        throw new ServiceConflictError("This service already has a profile. Reload before saving.");
      }
      if (current?.detail && !input.detail) {
        throw new ServiceSafetyError("The detail content was missing from this save, so the existing service page was kept safe.");
      }

      const nextRevision = currentRevision + 1;
      const detail = input.detail ? normalizeServiceDetail(input.detail) : null;
      let profileId: string;
      if (current) {
        const result = await transaction.serviceProfile.updateMany({
          where: { id: current.id, revision: currentRevision },
          data: {
            serviceKey: input.serviceKey ?? current.serviceKey,
            slug: input.slug,
            titleEn: input.titleEn,
            titleBn: input.titleBn,
            descriptionEn: input.descriptionEn,
            descriptionBn: input.descriptionBn,
            ...(detail ? { detail: asJson(detail) } : {}),
            status: currentStatus(current.status, Boolean(detail ?? current.detail)),
            revision: nextRevision,
          },
        });
        if (!result.count) throw new ServiceConflictError();
        profileId = current.id;
      } else {
        const created = await transaction.serviceProfile.create({
          data: {
            serviceKey: input.serviceKey ?? input.label,
            slug: input.slug,
            menuItemId,
            titleEn: input.titleEn,
            titleBn: input.titleBn,
            descriptionEn: input.descriptionEn,
            descriptionBn: input.descriptionBn,
            detail: detail ? asJson(detail) : Prisma.JsonNull,
            status: detail ? "DRAFT" : "LINK_ONLY",
            revision: 1,
          },
        });
        profileId = created.id;
      }

      // The menu item is the public destination source of truth. Updating it
      // here keeps the mega menu, landing cards and service catalogue aligned.
      await transaction.menuItem.update({
        where: { id: menuItemId },
        data: {
          label: input.label,
          description: input.description,
          href: input.href,
          icon: input.icon,
        },
      });

      await transaction.serviceProfileRevision.create({
        data: {
          profileId,
          version: nextRevision,
          kind: "DRAFT",
          snapshot: asJson(snapshotFromInput({ ...input, serviceKey: input.serviceKey ?? input.label, detail })),
          createdBy: updatedBy,
        },
      });

      const saved = await transaction.serviceProfile.findUnique({ where: { id: profileId } });
      if (!saved) throw new ServiceNotFoundError();
      return toRow(saved);
    });
  }

  public async publishProfile(id: string, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!current) throw new ServiceNotFoundError();
      if (current.revision !== expectedRevision) throw new ServiceConflictError("This service changed in another session. Reload before publishing.");
      if (!current.detail) throw new ServiceSafetyError("Save the service detail content before publishing this page.");

      const detail = normalizeServiceDetail(current.detail);
      if (!current.titleEn.trim() || !current.descriptionEn.trim() || !detail.overviewTitle.trim() || !detail.overviewDescription.trim()) {
        throw new ServiceSafetyError("Add a service title, summary and overview before publishing.");
      }

      const nextRevision = current.revision + 1;
      const result = await transaction.serviceProfile.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          detail: asJson(detail),
          publishedDetail: asJson(detail),
          status: "PUBLISHED",
          publishedRevision: nextRevision,
          publishedAt: new Date(),
          revision: nextRevision,
        },
      });
      if (!result.count) throw new ServiceConflictError("This service changed in another session. Reload before publishing.");

      await transaction.serviceProfileRevision.create({
        data: {
          profileId: id,
          version: nextRevision,
          kind: "PUBLISHED",
          snapshot: asJson(snapshotFromInput({ serviceKey: current.serviceKey, slug: current.slug, label: "", description: "", href: "", icon: "", titleEn: current.titleEn, titleBn: current.titleBn, descriptionEn: current.descriptionEn, descriptionBn: current.descriptionBn, detail })),
          createdBy: updatedBy,
        },
      });

      const saved = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!saved) throw new ServiceNotFoundError();
      return toRow(saved);
    });
  }

  public async unpublishProfile(id: string, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!current) throw new ServiceNotFoundError();
      if (current.revision !== expectedRevision) throw new ServiceConflictError("This service changed in another session. Reload before unpublishing.");

      const nextRevision = current.revision + 1;
      const result = await transaction.serviceProfile.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          status: current.detail ? "DRAFT" : "LINK_ONLY",
          publishedDetail: Prisma.JsonNull,
          revision: nextRevision,
        },
      });
      if (!result.count) throw new ServiceConflictError("This service changed in another session. Reload before unpublishing.");

      await transaction.serviceProfileRevision.create({
        data: {
          profileId: id,
          version: nextRevision,
          kind: "DRAFT",
          snapshot: asJson({ status: current.detail ? "DRAFT" : "LINK_ONLY" }),
          createdBy: updatedBy,
        },
      });

      const saved = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!saved) throw new ServiceNotFoundError();
      return toRow(saved);
    });
  }
}
