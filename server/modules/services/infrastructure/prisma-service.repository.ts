import { Prisma, type PrismaClient } from "@prisma/client";

import type { MenuSection } from "../../admin/domain/menu.js";
import {
  ServiceConflictError,
  ServiceNotFoundError,
  ServiceSafetyError,
  isLegacySeedProfile,
  type ServiceProfileRow,
  type ServiceProfileStatus,
  type ServiceMenuAssignment,
  type ServiceRepository,
} from "../domain/service.js";
import { normalizeServiceDetail } from "../domain/service.js";
import type { ServiceProfileInput } from "../../../../src/lib/service-types.js";
import { htmlToPlainText } from "../../../../src/lib/blog-content.js";

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
    icon: input.icon,
    titleEn: input.titleEn,
    titleBn: input.titleBn,
    descriptionEn: input.descriptionEn,
    descriptionBn: input.descriptionBn,
    mediaAssetId: input.mediaAssetId ?? null,
    detail: input.detail,
  };
}

function snapshotFromRow(row: ServiceProfileRow, detail: unknown) {
  return {
    serviceKey: row.serviceKey,
    slug: row.slug,
    menuItemId: row.menuItemId,
    menuLinkId: row.menuLinkId,
    menuSnapshot: row.menuSnapshot,
    icon: row.icon,
    titleEn: row.titleEn,
    titleBn: row.titleBn,
    descriptionEn: row.descriptionEn,
    descriptionBn: row.descriptionBn,
    mediaAssetId: row.mediaAssetId,
    publishedMediaAssetId: row.publishedMediaAssetId,
    detail,
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
                links: {
                  orderBy: { sortOrder: "asc" },
                  include: { serviceProfile: { select: { slug: true, publishedDetail: true, titleEn: true, titleBn: true, descriptionEn: true, descriptionBn: true } } },
                },
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

  public async createProfile(input: ServiceProfileInput, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const detail = input.detail ? normalizeServiceDetail(input.detail) : null;
      const serviceKey = input.serviceKey?.trim() || `service:${input.slug}`;
      const created = await transaction.serviceProfile.create({
        data: {
          serviceKey,
          slug: input.slug,
          menuItemId: null,
          menuLinkId: null,
          menuSnapshot: Prisma.JsonNull,
          icon: input.icon,
          origin: "ADMIN",
          titleEn: input.titleEn,
          titleBn: input.titleBn,
          descriptionEn: input.descriptionEn,
          descriptionBn: input.descriptionBn,
          mediaAssetId: input.mediaAssetId ?? null,
          detail: detail ? asJson(detail) : Prisma.JsonNull,
          status: detail ? "DRAFT" : "LINK_ONLY",
          revision: 1,
          revisions: {
            create: {
              version: 1,
              kind: "DRAFT",
              snapshot: asJson(snapshotFromInput({ ...input, serviceKey, detail })),
              createdBy: updatedBy,
            },
          },
        },
      });
      return toRow(created);
    });
  }

  public async updateProfile(id: string, input: ServiceProfileInput, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!current) throw new ServiceNotFoundError();
      if (expectedRevision !== current.revision) throw new ServiceConflictError();
      if (current?.detail && !input.detail) {
        throw new ServiceSafetyError("The detail content was missing from this save, so the existing service page was kept safe.");
      }

      const nextRevision = current.revision + 1;
      const detail = input.detail ? normalizeServiceDetail(input.detail) : null;
      const result = await transaction.serviceProfile.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          serviceKey: input.serviceKey?.trim() || current.serviceKey,
          slug: input.slug,
          icon: input.icon,
          titleEn: input.titleEn,
          titleBn: input.titleBn,
          descriptionEn: input.descriptionEn,
          descriptionBn: input.descriptionBn,
          ...(input.mediaAssetId !== undefined ? { mediaAssetId: input.mediaAssetId ?? null } : {}),
          ...(detail ? { detail: asJson(detail) } : {}),
          status: currentStatus(current.status, Boolean(detail ?? current.detail)),
          revision: nextRevision,
        },
      });
      if (!result.count) throw new ServiceConflictError();

      // A service owns its page URL. The menu editor owns the menu label,
      // description, icon, order and visibility, so editing a service only
      // keeps the assigned target's href in sync.
      if (current.menuItemId) {
        await transaction.menuItem.update({
          where: { id: current.menuItemId },
          data: { href: `/services/${input.slug}` },
        });
      } else if (current.menuLinkId) {
        await transaction.menuLink.update({
          where: { id: current.menuLinkId },
          data: { href: `/services/${input.slug}` },
        });
      }

      await transaction.serviceProfileRevision.create({
        data: {
          profileId: id,
          version: nextRevision,
          kind: "DRAFT",
          snapshot: asJson(snapshotFromInput({ ...input, serviceKey: input.serviceKey ?? current.serviceKey, detail })),
          createdBy: updatedBy,
        },
      });

      const saved = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!saved) throw new ServiceNotFoundError();
      return toRow(saved);
    });
  }

  public async assignProfile(id: string, target: ServiceMenuAssignment | null, expectedRevision: number, updatedBy: string): Promise<ServiceProfileRow> {
    return this.client.$transaction(async (transaction) => {
      const current = await transaction.serviceProfile.findUnique({ where: { id } });
      if (!current) throw new ServiceNotFoundError();
      if (current.revision !== expectedRevision) throw new ServiceConflictError("This service changed in another session. Reload before changing its menu assignment.");

      const menuItemId = target?.targetType === "ITEM" ? target.targetId : null;
      const menuLinkId = target?.targetType === "LINK" ? target.targetId : null;
      const sameTarget = current.menuItemId === menuItemId && current.menuLinkId === menuLinkId;

      if (!sameTarget && current.menuItemId && current.menuSnapshot) {
        const snapshot = current.menuSnapshot as { targetType?: string; targetId?: string; href?: string };
        if (snapshot.targetType === "ITEM" && snapshot.targetId === current.menuItemId) {
          const oldMenuItem = await transaction.menuItem.findUnique({ where: { id: current.menuItemId } });
          if (oldMenuItem && oldMenuItem.href === `/services/${current.slug}`) {
            await transaction.menuItem.update({ where: { id: oldMenuItem.id }, data: { href: snapshot.href ?? oldMenuItem.href } });
          }
        }
      }
      if (!sameTarget && current.menuLinkId && current.menuSnapshot) {
        const snapshot = current.menuSnapshot as { targetType?: string; targetId?: string; href?: string };
        if (snapshot.targetType === "LINK" && snapshot.targetId === current.menuLinkId) {
          const oldMenuLink = await transaction.menuLink.findUnique({ where: { id: current.menuLinkId } });
          if (oldMenuLink && oldMenuLink.href === `/services/${current.slug}`) {
            await transaction.menuLink.update({ where: { id: oldMenuLink.id }, data: { href: snapshot.href ?? oldMenuLink.href } });
          }
        }
      }

      let menuSnapshot: Prisma.InputJsonValue | typeof Prisma.JsonNull = sameTarget && current.menuSnapshot ? asJson(current.menuSnapshot) : Prisma.JsonNull;
      if (menuItemId) {
        const menuItem = await transaction.menuItem.findUnique({ where: { id: menuItemId } });
        if (!menuItem) throw new ServiceNotFoundError("That menu entry no longer exists. Refresh the menu list and try again.");
        menuSnapshot = { targetType: "ITEM", targetId: menuItem.id, href: menuItem.href };
        const assigned = await transaction.serviceProfile.findUnique({ where: { menuItemId } });
        if (assigned && assigned.id !== id) {
          const legacyAssigned = isLegacySeedProfile(toRow(assigned));
          if (!legacyAssigned) {
            throw new ServiceConflictError("That menu entry is already assigned to another service. Detach it there before reassigning it.");
          }
          // Older deployments may not have applied the standalone-service
          // migration yet. Release only an untouched placeholder here; never
          // replace a profile that contains content or revision history.
          await transaction.serviceProfile.update({ where: { id: assigned.id }, data: { menuItemId: null, origin: "SEED" } });
        }
      }
      if (menuLinkId) {
        const menuLink = await transaction.menuLink.findUnique({ where: { id: menuLinkId } });
        if (!menuLink) throw new ServiceNotFoundError("That menu link no longer exists. Refresh the menu list and try again.");
        menuSnapshot = { targetType: "LINK", targetId: menuLink.id, href: menuLink.href };
        const assigned = await transaction.serviceProfile.findUnique({ where: { menuLinkId } });
        if (assigned && assigned.id !== id) throw new ServiceConflictError("That menu link is already assigned to another service. Detach it there before reassigning it.");
      }

      const nextRevision = current.revision + 1;
      const result = await transaction.serviceProfile.updateMany({
        where: { id, revision: expectedRevision },
        data: { menuItemId, menuLinkId, menuSnapshot, revision: nextRevision },
      });
      if (!result.count) throw new ServiceConflictError("This service changed in another session. Reload before changing its menu assignment.");

      if (menuItemId) {
        await transaction.menuItem.update({
          where: { id: menuItemId },
          data: { href: `/services/${current.slug}` },
        });
      } else if (menuLinkId) {
        await transaction.menuLink.update({
          where: { id: menuLinkId },
          data: { href: `/services/${current.slug}` },
        });
      }

      const row = toRow({ ...current, menuItemId, menuLinkId, menuSnapshot, revision: nextRevision });
      await transaction.serviceProfileRevision.create({
        data: {
          profileId: id,
          version: nextRevision,
          kind: "DRAFT",
          snapshot: asJson(snapshotFromRow(row, current.detail)),
          createdBy: updatedBy,
        },
      });

      const saved = await transaction.serviceProfile.findUnique({ where: { id } });
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
      const publishedDetail = {
        ...detail,
        mediaUrl: current.mediaAssetId ? "/api/media/" + current.mediaAssetId : detail.mediaUrl,
      };
      const overviewText = detail.overviewHtml !== undefined
        ? htmlToPlainText(detail.overviewHtml)
        : detail.overviewDescriptionHtml ? htmlToPlainText(detail.overviewDescriptionHtml) : detail.overviewDescription.trim();
      const hasOverview = detail.overviewHtml !== undefined
        ? Boolean(overviewText)
        : Boolean(detail.overviewTitle.trim() && overviewText);
      if (!current.titleEn.trim() || !current.descriptionEn.trim() || !hasOverview) {
        throw new ServiceSafetyError("Add a service title, summary and overview before publishing.");
      }

      const nextRevision = current.revision + 1;
      const result = await transaction.serviceProfile.updateMany({
        where: { id, revision: expectedRevision },
        data: {
          detail: asJson(detail),
          publishedDetail: asJson(publishedDetail),
          publishedMediaAssetId: current.mediaAssetId,
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
          snapshot: asJson(snapshotFromInput({ serviceKey: current.serviceKey, slug: current.slug, label: "", description: "", href: "", icon: "", titleEn: current.titleEn, titleBn: current.titleBn, descriptionEn: current.descriptionEn, descriptionBn: current.descriptionBn, mediaAssetId: current.mediaAssetId, detail })),
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
          publishedMediaAssetId: null,
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
