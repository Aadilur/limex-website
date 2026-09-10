import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";

export const MAX_TEAM_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_LANDING_LOGO_BYTES = 5 * 1024 * 1024;
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;
export const SIGNED_IMAGE_TTL_SECONDS = 60 * 60;
export const LANDING_LOGO_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const BLOG_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

export const teamImageTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

export type TeamImageContentType = keyof typeof teamImageTypes;

export const landingLogoTypes = teamImageTypes;
export type LandingLogoContentType = keyof typeof landingLogoTypes;
export const blogImageTypes = teamImageTypes;
export type BlogImageContentType = keyof typeof blogImageTypes;

export type ImageUpload = {
  body: Buffer;
  contentType: TeamImageContentType;
};

export class StorageConfigurationError extends Error {
  public readonly statusCode = 503;

  public constructor() {
    super("Image storage is not configured.");
    this.name = "StorageConfigurationError";
  }
}

const storageConfig = env.BUCKET && env.ENDPOINT && env.ACCESS_KEY_ID && env.SECRET_ACCESS_KEY
  ? {
      bucket: env.BUCKET,
      endpoint: env.ENDPOINT,
      region: env.REGION,
      accessKeyId: env.ACCESS_KEY_ID,
      secretAccessKey: env.SECRET_ACCESS_KEY,
    }
  : null;

const storageClient = storageConfig
  ? new S3Client({
      region: storageConfig.region,
      endpoint: storageConfig.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.secretAccessKey,
      },
    })
  : null;

function requireStorage() {
  if (!storageConfig || !storageClient) throw new StorageConfigurationError();
  return { config: storageConfig, client: storageClient };
}

export function isSupportedTeamImageType(value: string): value is TeamImageContentType {
  return Object.prototype.hasOwnProperty.call(teamImageTypes, value);
}

export function isSupportedLandingLogoType(value: string): value is LandingLogoContentType {
  return Object.prototype.hasOwnProperty.call(landingLogoTypes, value);
}

export function isSupportedBlogImageType(value: string): value is BlogImageContentType {
  return Object.prototype.hasOwnProperty.call(blogImageTypes, value);
}

export function createTeamImageKey(contentType: TeamImageContentType) {
  return `about/team/${randomUUID()}${teamImageTypes[contentType]}`;
}

export function createLandingLogoKey(asset: string) {
  return `landing/logos/${asset}`;
}

export function createLandingLogoAsset(hash: string, contentType: LandingLogoContentType) {
  return `${hash}${landingLogoTypes[contentType]}`;
}

export function createBlogMediaKey(postId: string, hash: string, contentType: BlogImageContentType) {
  return `blog/${postId}/${hash}${blogImageTypes[contentType]}`;
}

export async function uploadStoredObject(key: string, image: ImageUpload, options?: { cacheControl?: string }) {
  const { config, client } = requireStorage();

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: image.body,
    ContentType: image.contentType,
    ContentLength: image.body.byteLength,
    CacheControl: options?.cacheControl ?? "private, no-store",
  }));
}

export async function getStoredObject(key: string) {
  const { config, client } = requireStorage();

  try {
    const response = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
    if (!response.Body) return null;

    return {
      body: response.Body,
      contentType: response.ContentType ?? "application/octet-stream",
      contentLength: response.ContentLength,
    };
  } catch (error) {
    const details = error && typeof error === "object"
      ? error as { name?: string; $metadata?: { httpStatusCode?: number } }
      : {};
    if (details.name === "NoSuchKey" || details.name === "NotFound" || details.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}

export async function signStoredObject(key: string) {
  if (!key || !storageConfig || !storageClient) return null;

  try {
    return await getSignedUrl(
      storageClient,
      new GetObjectCommand({ Bucket: storageConfig.bucket, Key: key }),
      { expiresIn: SIGNED_IMAGE_TTL_SECONDS },
    );
  } catch (error) {
    console.error(`Unable to sign stored image ${key}.`, error);
    return null;
  }
}

export async function deleteStoredObject(key: string | null) {
  if (!key) return;

  const { config, client } = requireStorage();
  await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
