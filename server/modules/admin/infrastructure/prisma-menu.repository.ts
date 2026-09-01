import type { PrismaClient } from "@prisma/client";

import type {
  CreateMenuGroupInput,
  CreateMenuItemInput,
  CreateMenuLinkInput,
  CreateMenuSectionInput,
  MenuRepository,
  MenuSection,
  UpdateMenuGroupInput,
  UpdateMenuItemInput,
  UpdateMenuLinkInput,
  UpdateMenuSectionInput,
} from "../domain/menu.js";

export class PrismaMenuRepository implements MenuRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async findTree(): Promise<MenuSection[]> {
    const sections = await this.client.menuSection.findMany({
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
                },
              },
            },
          },
        },
      },
    });

    return sections;
  }

  public async createSection(input: CreateMenuSectionInput): Promise<void> {
    await this.client.menuSection.create({
      data: {
        ...input,
        tone: input.tone ?? "green",
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public async updateSection(id: string, input: UpdateMenuSectionInput): Promise<void> {
    await this.client.menuSection.update({ where: { id }, data: input });
  }

  public async deleteSection(id: string): Promise<void> {
    await this.client.menuSection.delete({ where: { id } });
  }

  public async createGroup(input: CreateMenuGroupInput): Promise<void> {
    await this.client.menuGroup.create({
      data: {
        ...input,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public async updateGroup(id: string, input: UpdateMenuGroupInput): Promise<void> {
    await this.client.menuGroup.update({ where: { id }, data: input });
  }

  public async deleteGroup(id: string): Promise<void> {
    await this.client.menuGroup.delete({ where: { id } });
  }

  public async createItem(input: CreateMenuItemInput): Promise<void> {
    await this.client.menuItem.create({
      data: {
        ...input,
        icon: input.icon ?? "briefcase",
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public async updateItem(id: string, input: UpdateMenuItemInput): Promise<void> {
    await this.client.menuItem.update({ where: { id }, data: input });
  }

  public async deleteItem(id: string): Promise<void> {
    await this.client.menuItem.delete({ where: { id } });
  }

  public async createLink(input: CreateMenuLinkInput): Promise<void> {
    await this.client.menuLink.create({
      data: {
        ...input,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public async updateLink(id: string, input: UpdateMenuLinkInput): Promise<void> {
    await this.client.menuLink.update({ where: { id }, data: input });
  }

  public async deleteLink(id: string): Promise<void> {
    await this.client.menuLink.delete({ where: { id } });
  }
}
