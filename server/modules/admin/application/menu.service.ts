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

export type PublicMenuChild = {
  label: string;
  href: string;
};

export type PublicMenuItem = {
  label: string;
  description: string;
  href: string;
  marker: string;
  icon: string;
  children?: PublicMenuChild[];
};

export type PublicMenuGroup = {
  key: string;
  label: string;
  railLabel: string;
  description: string;
  items: PublicMenuItem[];
};

export type PublicMenuSection = {
  key: string;
  label: string;
  href: string;
  active?: boolean;
  megaGroups?: PublicMenuGroup[];
  menuEyebrow?: string;
  menuTitle?: string;
  menuDescription?: string;
  tone?: "green" | "violet" | "teal" | "orange";
  spotlight?: {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

function resolveTone(value: string): PublicMenuSection["tone"] {
  return value === "violet" || value === "teal" || value === "orange" ? value : "green";
}

function toPublicNavigation(sections: MenuSection[]): PublicMenuSection[] {
  return sections
    .filter((section) => section.isVisible)
    .map((section, sectionIndex) => {
      const visibleGroups = section.groups
        .filter((group) => group.isVisible)
        .map((group) => ({
          key: group.key,
          label: group.label,
          railLabel: group.railLabel,
          description: group.description,
          items: group.items
            .filter((item) => item.isVisible)
            .map((item) => ({
              label: item.label,
              description: item.description,
              href: item.href,
              marker: item.marker,
              icon: item.icon,
              ...(item.links.some((link) => link.isVisible)
                ? { children: item.links.filter((link) => link.isVisible).map(({ label, href }) => ({ label, href })) }
                : {}),
            })),
        }));

      const hasSpotlight = section.spotlightBadge && section.spotlightTitle && section.spotlightDescription && section.spotlightCtaLabel && section.spotlightCtaHref;

      return {
        key: section.key,
        label: section.label,
        href: section.href,
        active: sectionIndex === 0,
        megaGroups: visibleGroups,
        ...(section.menuEyebrow ? { menuEyebrow: section.menuEyebrow } : {}),
        ...(section.menuTitle ? { menuTitle: section.menuTitle } : {}),
        ...(section.menuDescription ? { menuDescription: section.menuDescription } : {}),
        tone: resolveTone(section.tone),
        ...(hasSpotlight
          ? {
              spotlight: {
                badge: section.spotlightBadge!,
                title: section.spotlightTitle!,
                description: section.spotlightDescription!,
                ctaLabel: section.spotlightCtaLabel!,
                ctaHref: section.spotlightCtaHref!,
              },
            }
          : {}),
      } satisfies PublicMenuSection;
    });
}

export class MenuService {
  public constructor(private readonly menus: MenuRepository) {}

  public getMenu(): Promise<MenuSection[]> {
    return this.menus.findTree();
  }

  public async getPublicNavigation(): Promise<PublicMenuSection[]> {
    return toPublicNavigation(await this.getMenu());
  }

  public createSection(input: CreateMenuSectionInput): Promise<void> {
    return this.menus.createSection(input);
  }

  public updateSection(id: string, input: UpdateMenuSectionInput): Promise<void> {
    return this.menus.updateSection(id, input);
  }

  public deleteSection(id: string): Promise<void> {
    return this.menus.deleteSection(id);
  }

  public createGroup(input: CreateMenuGroupInput): Promise<void> {
    return this.menus.createGroup(input);
  }

  public updateGroup(id: string, input: UpdateMenuGroupInput): Promise<void> {
    return this.menus.updateGroup(id, input);
  }

  public deleteGroup(id: string): Promise<void> {
    return this.menus.deleteGroup(id);
  }

  public createItem(input: CreateMenuItemInput): Promise<void> {
    return this.menus.createItem(input);
  }

  public updateItem(id: string, input: UpdateMenuItemInput): Promise<void> {
    return this.menus.updateItem(id, input);
  }

  public deleteItem(id: string): Promise<void> {
    return this.menus.deleteItem(id);
  }

  public createLink(input: CreateMenuLinkInput): Promise<void> {
    return this.menus.createLink(input);
  }

  public updateLink(id: string, input: UpdateMenuLinkInput): Promise<void> {
    return this.menus.updateLink(id, input);
  }

  public deleteLink(id: string): Promise<void> {
    return this.menus.deleteLink(id);
  }
}
