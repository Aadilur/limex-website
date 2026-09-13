export type MenuServiceProfileReference = {
  slug: string;
  publishedDetail: unknown;
  titleEn?: string;
  titleBn?: string;
  descriptionEn?: string;
  descriptionBn?: string;
};

export type MenuLink = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  serviceProfile?: MenuServiceProfileReference | null;
};

export type MenuItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  marker: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: Date;
  links: MenuLink[];
  serviceProfile?: MenuServiceProfileReference | null;
};

export type MenuGroup = {
  id: string;
  key: string;
  label: string;
  railLabel: string;
  description: string;
  sortOrder: number;
  isVisible: boolean;
  items: MenuItem[];
};

export type MenuSection = {
  id: string;
  key: string;
  label: string;
  href: string;
  menuEyebrow: string | null;
  menuTitle: string | null;
  menuDescription: string | null;
  spotlightBadge: string | null;
  spotlightTitle: string | null;
  spotlightDescription: string | null;
  spotlightCtaLabel: string | null;
  spotlightCtaHref: string | null;
  tone: string;
  sortOrder: number;
  isVisible: boolean;
  groups: MenuGroup[];
};

export type CreateMenuSectionInput = {
  key: string;
  label: string;
  href: string;
  menuEyebrow?: string;
  menuTitle?: string;
  menuDescription?: string;
  spotlightBadge?: string;
  spotlightTitle?: string;
  spotlightDescription?: string;
  spotlightCtaLabel?: string;
  spotlightCtaHref?: string;
  tone?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateMenuSectionInput = Partial<CreateMenuSectionInput>;

export type CreateMenuGroupInput = {
  sectionId: string;
  key: string;
  label: string;
  railLabel: string;
  description: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateMenuGroupInput = Partial<Omit<CreateMenuGroupInput, "sectionId">>;

export type CreateMenuItemInput = {
  groupId: string;
  label: string;
  description: string;
  href: string;
  marker: string;
  icon?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateMenuItemInput = Partial<Omit<CreateMenuItemInput, "groupId">>;

export type CreateMenuLinkInput = {
  itemId: string;
  label: string;
  href: string;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateMenuLinkInput = Partial<Omit<CreateMenuLinkInput, "itemId">>;

export interface MenuRepository {
  findTree(): Promise<MenuSection[]>;
  createSection(input: CreateMenuSectionInput): Promise<void>;
  updateSection(id: string, input: UpdateMenuSectionInput): Promise<void>;
  deleteSection(id: string): Promise<void>;
  createGroup(input: CreateMenuGroupInput): Promise<void>;
  updateGroup(id: string, input: UpdateMenuGroupInput): Promise<void>;
  deleteGroup(id: string): Promise<void>;
  createItem(input: CreateMenuItemInput): Promise<void>;
  updateItem(id: string, input: UpdateMenuItemInput): Promise<void>;
  deleteItem(id: string): Promise<void>;
  createLink(input: CreateMenuLinkInput): Promise<void>;
  updateLink(id: string, input: UpdateMenuLinkInput): Promise<void>;
  deleteLink(id: string): Promise<void>;
}
