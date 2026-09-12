import { Prisma, type PrismaClient } from "@prisma/client";

import type { MediaAssetRecord, MediaFolderRecord, MediaRepository } from "../domain/media.js";

function toFolder(row: any): MediaFolderRecord {
  return {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    isSystem: row.isSystem,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row._count ? { assetCount: row._count.assets } : {}),
  };
}

function assetInclude() {
  return {
    folder: true,
    blogMedia: {
      select: {
        id: true,
        postId: true,
        post: { select: { slug: true, status: true } },
      },
    },
    serviceDraftProfiles: {
      select: {
        id: true,
        slug: true,
        titleEn: true,
        status: true,
      },
    },
    servicePublishedProfiles: {
      select: {
        id: true,
        slug: true,
        titleEn: true,
        status: true,
      },
    },
  } satisfies Prisma.MediaAssetInclude;
}

function toAsset(row: any): MediaAssetRecord {
  return {
    id: row.id,
    folderId: row.folderId,
    objectKey: row.objectKey,
    originalName: row.originalName,
    displayName: row.displayName,
    contentType: row.contentType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    checksum: row.checksum,
    altText: row.altText,
    caption: row.caption,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    folder: row.folder ? toFolder(row.folder) : undefined,
    blogMedia: row.blogMedia ?? null,
    serviceDraftProfiles: row.serviceDraftProfiles ?? [],
    servicePublishedProfiles: row.servicePublishedProfiles ?? [],
  };
}

export class PrismaMediaRepository implements MediaRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async findFolder(id: string) {
    const row = await this.client.mediaFolder.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
    return row ? toFolder(row) : null;
  }

  public async findFolderByName(parentId: string | null, name: string) {
    const row = await this.client.mediaFolder.findFirst({
      where: { parentId, name },
      include: { _count: { select: { assets: true } } },
    });
    return row ? toFolder(row) : null;
  }

  public async createFolder(input: { parentId: string | null; name: string; isSystem?: boolean }) {
    const row = await this.client.mediaFolder.create({
      data: {
        parentId: input.parentId,
        name: input.name,
        isSystem: input.isSystem ?? false,
      },
      include: { _count: { select: { assets: true } } },
    });
    return toFolder(row);
  }

  public async listChildFolders(parentId: string | null) {
    const rows = await this.client.mediaFolder.findMany({
      where: { parentId },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }, { id: "asc" }],
      include: { _count: { select: { assets: true } } },
    });
    return rows.map(toFolder);
  }

  public async listAssets(folderId: string) {
    const rows = await this.client.mediaAsset.findMany({
      where: { folderId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: assetInclude(),
    });
    return rows.map(toAsset);
  }

  public async findAsset(id: string) {
    const row = await this.client.mediaAsset.findUnique({
      where: { id },
      include: assetInclude(),
    });
    return row ? toAsset(row) : null;
  }

  public async findAssetByObjectKey(objectKey: string) {
    const row = await this.client.mediaAsset.findUnique({
      where: { objectKey },
      include: assetInclude(),
    });
    return row ? toAsset(row) : null;
  }

  public async createAsset(input: {
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
  }) {
    const row = await this.client.mediaAsset.create({
      data: {
        folderId: input.folderId,
        objectKey: input.objectKey,
        originalName: input.originalName,
        displayName: input.displayName,
        contentType: input.contentType,
        byteSize: input.byteSize,
        width: input.width ?? null,
        height: input.height ?? null,
        checksum: input.checksum,
        altText: input.altText ?? null,
        caption: input.caption ?? null,
      },
      include: assetInclude(),
    });
    return toAsset(row);
  }

  public async updateAsset(id: string, input: { displayName?: string; altText?: string | null; caption?: string | null; folderId?: string }) {
    const row = await this.client.mediaAsset.update({
      where: { id },
      data: input,
      include: assetInclude(),
    });
    return toAsset(row);
  }

  public async deleteAsset(id: string) {
    await this.client.mediaAsset.delete({ where: { id } });
  }

  public async findLegacyBlogMedia() {
    const rows = await this.client.blogPostMedia.findMany({
      where: { mediaAssetId: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 500,
      include: {
        post: {
          select: {
            slug: true,
            translations: {
              where: { locale: "en" },
              select: { title: true },
              take: 1,
            },
          },
        },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      postId: row.postId,
      objectKey: row.objectKey,
      contentType: row.contentType,
      byteSize: row.byteSize,
      width: row.width,
      height: row.height,
      altText: row.altText,
      caption: row.caption,
      post: {
        slug: row.post.slug,
        title: row.post.translations[0]?.title || row.post.slug,
      },
    }));
  }

  public async attachBlogMedia(mediaId: string, assetId: string) {
    await this.client.blogPostMedia.update({
      where: { id: mediaId },
      data: { mediaAssetId: assetId },
    });
  }

  public async createBlogMedia(input: {
    postId: string;
    mediaAssetId: string;
    objectKey: string;
    contentType: string;
    byteSize: number;
    width?: number | null;
    height?: number | null;
    altText?: string | null;
    caption?: string | null;
  }) {
    return this.client.blogPostMedia.create({
      data: {
        postId: input.postId,
        mediaAssetId: input.mediaAssetId,
        objectKey: input.objectKey,
        contentType: input.contentType,
        byteSize: input.byteSize,
        width: input.width ?? null,
        height: input.height ?? null,
        altText: input.altText ?? null,
        caption: input.caption ?? null,
      },
      select: { id: true },
    });
  }

  public async deleteBlogMedia(id: string) {
    const current = await this.client.blogPostMedia.findUnique({
      where: { id },
      select: { mediaAssetId: true, objectKey: true },
    });
    if (!current) return null;
    await this.client.blogPostMedia.delete({ where: { id } });
    return current;
  }
}
