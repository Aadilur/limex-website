export type MediaFolderRecord = {
  id: string;
  parentId: string | null;
  name: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  assetCount?: number;
};

export type MediaAssetRecord = {
  id: string;
  folderId: string;
  objectKey: string;
  originalName: string;
  displayName: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksum: string;
  altText: string | null;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  folder?: MediaFolderRecord;
  blogMedia?: { id: string; postId: string; post: { slug: string; status: string } } | null;
  serviceDraftProfiles?: Array<{ id: string; slug: string; titleEn: string; status: string }>;
  servicePublishedProfiles?: Array<{ id: string; slug: string; titleEn: string; status: string }>;
};

export type MediaBreadcrumb = {
  id: string;
  name: string;
};

export type MediaLibrary = {
  currentFolder: MediaFolderRecord | null;
  breadcrumbs: MediaBreadcrumb[];
  folders: MediaFolderRecord[];
  assets: MediaAssetRecord[];
};

export type MediaAssetResponse = {
  id: string;
  folderId: string;
  originalName: string;
  displayName: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string;
  caption: string;
  url: string;
  publicUrl: string;
  urlExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  usage: { type: "blog" | "service"; label: string; href: string } | null;
};

export class MediaNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor(message = "Media was not found.") {
    super(message);
    this.name = "MediaNotFoundError";
  }
}

export class MediaInputError extends Error {
  public readonly statusCode = 400;

  public constructor(message: string) {
    super(message);
    this.name = "MediaInputError";
  }
}

export class MediaConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(message: string) {
    super(message);
    this.name = "MediaConflictError";
  }
}

export class MediaInUseError extends Error {
  public readonly statusCode = 422;

  public constructor(message = "This media is still used by published content.") {
    super(message);
    this.name = "MediaInUseError";
  }
}

export interface MediaRepository {
  findFolder(id: string): Promise<MediaFolderRecord | null>;
  findFolderByName(parentId: string | null, name: string): Promise<MediaFolderRecord | null>;
  createFolder(input: { parentId: string | null; name: string; isSystem?: boolean }): Promise<MediaFolderRecord>;
  listChildFolders(parentId: string | null): Promise<MediaFolderRecord[]>;
  listAssets(folderId: string): Promise<MediaAssetRecord[]>;
  findAsset(id: string): Promise<MediaAssetRecord | null>;
  findAssetByObjectKey(objectKey: string): Promise<MediaAssetRecord | null>;
  createAsset(input: {
    folderId: string;
    objectKey: string;
    originalName: string;
    displayName: string;
    contentType: string;
    byteSize: number;
    width?: number | null;
    height?: number | null;
    checksum: string;
    altText?: string | null;
    caption?: string | null;
  }): Promise<MediaAssetRecord>;
  updateAsset(id: string, input: { displayName?: string; altText?: string | null; caption?: string | null; folderId?: string }): Promise<MediaAssetRecord>;
  deleteAsset(id: string): Promise<void>;
  findLegacyBlogMedia(): Promise<Array<{
    id: string;
    postId: string;
    objectKey: string;
    contentType: string;
    byteSize: number;
    width: number | null;
    height: number | null;
    altText: string | null;
    caption: string | null;
    post: { slug: string; title: string };
  }>>;
  attachBlogMedia(mediaId: string, assetId: string): Promise<void>;
  createBlogMedia(input: {
    postId: string;
    mediaAssetId: string;
    objectKey: string;
    contentType: string;
    byteSize: number;
    width?: number | null;
    height?: number | null;
    altText?: string | null;
    caption?: string | null;
  }): Promise<{ id: string }>;
  deleteBlogMedia(id: string): Promise<{ mediaAssetId: string | null; objectKey: string } | null>;
}
