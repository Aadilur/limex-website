import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import {
  MEDIA_ASSET_CACHE_CONTROL,
  SIGNED_IMAGE_TTL_SECONDS,
  createMediaObjectKey,
  deleteStoredObject,
  signStoredObject,
  uploadStoredObject,
  type ImageUpload,
} from "../../../shared/storage/object-storage.js";
import {
  MediaConflictError,
  MediaInUseError,
  MediaInputError,
  MediaNotFoundError,
  type MediaAssetRecord,
  type MediaAssetResponse,
  type MediaFolderRecord,
  type MediaRepository,
} from "../domain/media.js";

const systemFolderNames = ["Blog", "Landing", "About", "General"] as const;

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function cleanFolderName(value: string) {
  return value.replace(/[\\/]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

function cleanFileName(value: string, fallback = "Untitled media") {
  return value.replace(/[\\/]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 255) || fallback;
}

function cleanOptionalText(value: string | undefined, max: number) {
  const cleaned = value?.replace(/\s+/g, " ").trim().slice(0, max) ?? "";
  return cleaned || null;
}

function legacyChecksum(objectKey: string) {
  return createHash("sha256").update("legacy:" + objectKey).digest("hex");
}

export class MediaService {
  public constructor(private readonly media: MediaRepository) {}

  private async ensureFolder(parentId: string | null, name: string, isSystem = false) {
    const existing = await this.media.findFolderByName(parentId, name);
    if (existing) return existing;

    try {
      return await this.media.createFolder({ parentId, name, isSystem });
    } catch (error) {
      if (!isUniqueError(error)) throw error;
      const concurrent = await this.media.findFolderByName(parentId, name);
      if (concurrent) return concurrent;
      throw error;
    }
  }

  private async ensureFolderPath(names: string[]) {
    let parentId: string | null = null;
    let folder: MediaFolderRecord | null = null;

    for (const name of names) {
      const cleanedName = cleanFolderName(name);
      if (!cleanedName) throw new MediaInputError("Choose a destination folder.");
      folder = await this.ensureFolder(parentId, cleanedName, parentId === null && systemFolderNames.includes(cleanedName as (typeof systemFolderNames)[number]));
      parentId = folder.id;
    }

    if (!folder) throw new MediaInputError("Choose a destination folder.");
    return folder;
  }

  private async breadcrumbs(folderId: string | null) {
    const trail: Array<{ id: string; name: string }> = [];
    let currentId = folderId;
    let depth = 0;

    while (currentId && depth < 25) {
      const folder = await this.media.findFolder(currentId);
      if (!folder) break;
      trail.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
      depth += 1;
    }

    return trail;
  }

  private async toResponse(asset: MediaAssetRecord): Promise<MediaAssetResponse> {
    const publicUrl = "/api/media/" + asset.id;
    const signedUrl = await signStoredObject(asset.objectKey);
    const urlExpiresAt = signedUrl
      ? new Date(Date.now() + SIGNED_IMAGE_TTL_SECONDS * 1000).toISOString()
      : null;

    return {
      id: asset.id,
      folderId: asset.folderId,
      originalName: asset.originalName,
      displayName: asset.displayName,
      contentType: asset.contentType,
      byteSize: asset.byteSize,
      width: asset.width,
      height: asset.height,
      altText: asset.altText ?? "",
      caption: asset.caption ?? "",
      url: signedUrl ?? publicUrl,
      publicUrl,
      urlExpiresAt,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      usage: asset.blogMedia
        ? {
            type: "blog",
            label: asset.blogMedia.post.slug,
            href: "/admin/blog/" + asset.blogMedia.postId,
          }
        : null,
    };
  }

  private async uploadRecord(
    folderId: string,
    image: ImageUpload,
    input: {
      originalName: string;
      displayName?: string;
      width?: number | null;
      height?: number | null;
      altText?: string;
      caption?: string;
    },
  ) {
    const objectKey = createMediaObjectKey(folderId, image.contentType);
    const displayName = cleanFileName(input.displayName || input.originalName);

    await uploadStoredObject(objectKey, image, { cacheControl: MEDIA_ASSET_CACHE_CONTROL });

    try {
      return await this.media.createAsset({
        folderId,
        objectKey,
        originalName: cleanFileName(input.originalName),
        displayName,
        contentType: image.contentType,
        byteSize: image.body.byteLength,
        width: input.width ?? null,
        height: input.height ?? null,
        checksum: createHash("sha256").update(image.body).digest("hex"),
        altText: cleanOptionalText(input.altText, 240),
        caption: cleanOptionalText(input.caption, 300),
      });
    } catch (error) {
      try {
        await deleteStoredObject(objectKey);
      } catch (cleanupError) {
        console.error("Unable to clean up media object " + objectKey + ".", cleanupError);
      }
      throw error;
    }
  }

  private async syncLegacyBlogMedia() {
    const legacy = await this.media.findLegacyBlogMedia();
    for (const item of legacy) {
      try {
        const folder = await this.ensureFolderPath(["Blog", item.post.slug]);
        const existing = await this.media.findAssetByObjectKey(item.objectKey);
        const asset = existing ?? await this.media.createAsset({
          folderId: folder.id,
          objectKey: item.objectKey,
          originalName: cleanFileName(item.objectKey.split("/").pop() ?? "legacy-image"),
          displayName: cleanFileName(item.post.title || item.post.slug),
          contentType: item.contentType,
          byteSize: item.byteSize,
          width: item.width,
          height: item.height,
          checksum: legacyChecksum(item.objectKey),
          altText: item.altText,
          caption: item.caption,
        });
        await this.media.attachBlogMedia(item.id, asset.id);
      } catch (error) {
        console.warn("Unable to index legacy blog media " + item.id + ".", error);
      }
    }
  }

  public async list(folderId: string | null): Promise<{
    currentFolder: MediaFolderRecord | null;
    breadcrumbs: Array<{ id: string; name: string }>;
    folders: MediaFolderRecord[];
    assets: MediaAssetResponse[];
  }> {
    await Promise.all(systemFolderNames.map((name) => this.ensureFolder(null, name, true)));
    await this.syncLegacyBlogMedia();

    const currentFolder = folderId ? await this.media.findFolder(folderId) : null;
    if (folderId && !currentFolder) throw new MediaNotFoundError("That folder no longer exists.");

    const [folders, assets] = await Promise.all([
      this.media.listChildFolders(currentFolder?.id ?? null),
      currentFolder ? this.media.listAssets(currentFolder.id) : Promise.resolve([]),
    ]);

    return {
      currentFolder,
      breadcrumbs: await this.breadcrumbs(currentFolder?.id ?? null),
      folders,
      assets: await Promise.all(assets.map((asset) => this.toResponse(asset))),
    };
  }

  public async createFolder(name: string, parentId: string | null) {
    const cleanedName = cleanFolderName(name);
    if (cleanedName.length < 1) throw new MediaInputError("Give the folder a name.");
    if (!parentId && systemFolderNames.includes(cleanedName as (typeof systemFolderNames)[number])) {
      throw new MediaConflictError("That name is reserved for a system folder.");
    }
    if (parentId) {
      const parent = await this.media.findFolder(parentId);
      if (!parent) throw new MediaNotFoundError("The parent folder no longer exists.");
    }

    try {
      return await this.media.createFolder({ parentId, name: cleanedName });
    } catch (error) {
      if (isUniqueError(error)) throw new MediaConflictError("A folder with this name already exists here.");
      throw error;
    }
  }

  public async uploadAsset(input: {
    folderId: string;
    image: ImageUpload;
    originalName: string;
    displayName?: string;
    width?: number | null;
    height?: number | null;
    altText?: string;
    caption?: string;
  }) {
    const folder = await this.media.findFolder(input.folderId);
    if (!folder) throw new MediaNotFoundError("Choose a folder that still exists.");
    return this.toResponse(await this.uploadRecord(folder.id, input.image, input));
  }

  public async uploadBlogImage(input: {
    postId: string;
    postSlug: string;
    image: ImageUpload;
    originalName: string;
    width?: number | null;
    height?: number | null;
    altText?: string;
    caption?: string;
  }) {
    const folder = await this.ensureFolderPath(["Blog", input.postSlug]);
    const asset = await this.uploadRecord(folder.id, input.image, input);

    try {
      const blogMedia = await this.media.createBlogMedia({
        postId: input.postId,
        mediaAssetId: asset.id,
        objectKey: asset.objectKey,
        contentType: asset.contentType,
        byteSize: asset.byteSize,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
      });
      return { asset: await this.toResponse(asset), blogMediaId: blogMedia.id };
    } catch (error) {
      try {
        await deleteStoredObject(asset.objectKey);
        await this.media.deleteAsset(asset.id);
      } catch (cleanupError) {
        console.error("Unable to clean up failed blog media " + asset.id + ".", cleanupError);
      }
      throw error;
    }
  }

  public async getAsset(id: string) {
    const asset = await this.media.findAsset(id);
    if (!asset) throw new MediaNotFoundError();
    return asset;
  }

  public async getSignedAssetUrl(id: string) {
    const asset = await this.getAsset(id);
    return signStoredObject(asset.objectKey);
  }

  public async updateAsset(id: string, input: { displayName?: string; altText?: string; caption?: string; folderId?: string }) {
    const current = await this.getAsset(id);
    const nextFolderId = input.folderId ?? current.folderId;
    if (input.folderId && !(await this.media.findFolder(input.folderId))) {
      throw new MediaNotFoundError("That destination folder no longer exists.");
    }
    const displayName = input.displayName === undefined ? undefined : cleanFileName(input.displayName);
    return this.toResponse(await this.media.updateAsset(id, {
      ...(displayName ? { displayName } : {}),
      ...(input.altText === undefined ? {} : { altText: cleanOptionalText(input.altText, 240) }),
      ...(input.caption === undefined ? {} : { caption: cleanOptionalText(input.caption, 300) }),
      ...(nextFolderId !== current.folderId ? { folderId: nextFolderId } : {}),
    }));
  }

  public async deleteAsset(id: string) {
    const current = await this.getAsset(id);
    if (current.blogMedia) {
      throw new MediaInUseError("Remove this image from the blog article " + current.blogMedia.post.slug + " before deleting it.");
    }

    await deleteStoredObject(current.objectKey);
    try {
      await this.media.deleteAsset(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new MediaNotFoundError();
      }
      throw error;
    }
    return { deleted: true };
  }

  public async deleteBlogMedia(id: string) {
    const current = await this.media.deleteBlogMedia(id);
    if (!current) throw new MediaNotFoundError("Image not found.");
    if (current.mediaAssetId) {
      try {
        await deleteStoredObject(current.objectKey);
      } finally {
        await this.media.deleteAsset(current.mediaAssetId);
      }
    } else {
      await deleteStoredObject(current.objectKey);
    }
  }
}
