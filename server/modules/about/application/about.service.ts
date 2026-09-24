import type {
  AboutReel,
  AboutReelRepository,
  AboutRepository,
  AboutTeamMember,
  CreateAboutReelRecordInput,
  UpdateAboutReelRecordInput,
  CreateAboutTeamMemberInput,
  UpdateAboutTeamMemberInput,
} from "../domain/about.js";
import {
  createTeamImageKey,
  deleteStoredObject,
  uploadStoredObject,
  type ImageUpload,
} from "../../../shared/storage/object-storage.js";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
  normalizeYouTubeUrl,
} from "../domain/youtube.js";

export type AboutTeamMemberResponse = {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export type AboutReelResponse = {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string | null;
  youtubeTitle: string;
  thumbnailUrl: string;
  embedUrl: string;
  sortOrder: number;
  isVisible: boolean;
};

export class AboutTeamMemberNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor() {
    super("The requested team member was not found.");
    this.name = "AboutTeamMemberNotFoundError";
  }
}

export class AboutReelNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor() {
    super("The requested video reel was not found.");
    this.name = "AboutReelNotFoundError";
  }
}

export class InvalidYouTubeUrlError extends Error {
  public readonly statusCode = 400;

  public constructor() {
    super("Paste a valid YouTube video link.");
    this.name = "InvalidYouTubeUrlError";
  }
}

const youtubeTitleFallback = "Watch on YouTube";
const youtubeTitleCache = new Map<string, { title: string; expiresAt: number }>();
const youtubeTitleCacheTtl = 1000 * 60 * 60 * 24;

async function resolveYouTubeTitle(youtubeUrl: string) {
  const cached = youtubeTitleCache.get(youtubeUrl);
  if (cached && cached.expiresAt > Date.now()) return cached.title;

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error(`YouTube oEmbed returned ${response.status}.`);

    const payload = await response.json() as { title?: unknown };
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 200) : "";
    if (title) {
      youtubeTitleCache.set(youtubeUrl, { title, expiresAt: Date.now() + youtubeTitleCacheTtl });
      return title;
    }
  } catch (error) {
    console.warn("Unable to resolve the YouTube reel title; using the fallback title.", error);
  }

  return youtubeTitleFallback;
}

async function cleanupStoredImage(key: string | null) {
  if (!key) return;

  try {
    await deleteStoredObject(key);
  } catch (error) {
    console.error(`Unable to remove stored team image ${key}.`, error);
  }
}

export class AboutService {
  public constructor(
    private readonly members: AboutRepository,
    private readonly reels: AboutReelRepository,
  ) {}

  private async toResponse(member: AboutTeamMember): Promise<AboutTeamMemberResponse> {
    return {
      id: member.id,
      name: member.name,
      title: member.title,
      description: member.description,
      imageUrl: member.imageKey ? "/api/about/team/" + member.id + "/image" : null,
      sortOrder: member.sortOrder,
      isVisible: member.isVisible,
    };
  }

  private async toResponses(members: AboutTeamMember[]) {
    return Promise.all(members.map((member) => this.toResponse(member)));
  }

  private toReelResponse(reel: AboutReel): AboutReelResponse {
    return {
      id: reel.id,
      youtubeUrl: reel.youtubeUrl,
      videoId: reel.videoId,
      title: reel.title,
      youtubeTitle: reel.youtubeTitle ?? youtubeTitleFallback,
      thumbnailUrl: getYouTubeThumbnailUrl(reel.videoId),
      embedUrl: getYouTubeEmbedUrl(reel.videoId),
      sortOrder: reel.sortOrder,
      isVisible: reel.isVisible,
    };
  }

  private toReelResponses(reels: AboutReel[]) {
    return reels.map((reel) => this.toReelResponse(reel));
  }

  public async getPublicTeam(): Promise<AboutTeamMemberResponse[]> {
    return this.toResponses(await this.members.findAll({ visibleOnly: true }));
  }

  public async getAdminTeam(): Promise<AboutTeamMemberResponse[]> {
    return this.toResponses(await this.members.findAll());
  }

  public async getTeamImageKey(id: string) {
    const member = await this.members.findById(id);
    if (!member) throw new AboutTeamMemberNotFoundError();
    return member.imageKey;
  }

  public async getPublicReels(): Promise<AboutReelResponse[]> {
    return this.toReelResponses(await this.reels.findAllReels({ visibleOnly: true }));
  }

  public async getAdminReels(): Promise<AboutReelResponse[]> {
    return this.toReelResponses(await this.reels.findAllReels());
  }

  public async createReel(input: Omit<CreateAboutReelRecordInput, "videoId" | "youtubeTitle">) {
    const videoId = getYouTubeVideoId(input.youtubeUrl);
    if (!videoId) throw new InvalidYouTubeUrlError();

    const youtubeUrl = normalizeYouTubeUrl(videoId);
    const title = input.title?.trim() || null;
    const youtubeTitle = title ? null : await resolveYouTubeTitle(youtubeUrl);

    return this.reels.createReel({
      ...input,
      youtubeUrl,
      videoId,
      title,
      youtubeTitle,
    });
  }

  public async updateReel(id: string, input: Omit<UpdateAboutReelRecordInput, "videoId" | "youtubeTitle">) {
    const current = await this.reels.findReelById(id);
    if (!current) throw new AboutReelNotFoundError();

    const hasUrlChange = input.youtubeUrl !== undefined;
    const nextVideoId = hasUrlChange ? getYouTubeVideoId(input.youtubeUrl ?? "") : current.videoId;
    if (!nextVideoId) throw new InvalidYouTubeUrlError();

    const hasTitleChange = Object.prototype.hasOwnProperty.call(input, "title");
    const nextTitle = hasTitleChange ? input.title?.trim() || null : current.title;
    const nextUrl = hasUrlChange ? normalizeYouTubeUrl(nextVideoId) : current.youtubeUrl;
    const nextYouTubeTitle = hasUrlChange || (hasTitleChange && !nextTitle)
      ? nextTitle ? null : await resolveYouTubeTitle(nextUrl)
      : current.youtubeTitle;

    return this.reels.updateReel(id, {
      ...(hasUrlChange ? { youtubeUrl: nextUrl, videoId: nextVideoId } : {}),
      ...(hasTitleChange ? { title: nextTitle } : {}),
      ...(hasUrlChange || (hasTitleChange && !nextTitle) ? { youtubeTitle: nextYouTubeTitle } : {}),
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      ...(input.isVisible === undefined ? {} : { isVisible: input.isVisible }),
    });
  }

  public async deleteReel(id: string) {
    const current = await this.reels.findReelById(id);
    if (!current) throw new AboutReelNotFoundError();

    await this.reels.deleteReel(id);
  }

  public async createTeamMember(input: CreateAboutTeamMemberInput, image?: ImageUpload) {
    let imageKey: string | null = null;

    try {
      if (image) {
        imageKey = createTeamImageKey(image.contentType);
        await uploadStoredObject(imageKey, image);
      }

      return await this.members.create({ ...input, imageKey });
    } catch (error) {
      await cleanupStoredImage(imageKey);
      throw error;
    }
  }

  public async updateTeamMember(
    id: string,
    input: UpdateAboutTeamMemberInput,
    image?: ImageUpload,
    removeImage = false,
  ) {
    const current = await this.members.findById(id);
    if (!current) throw new AboutTeamMemberNotFoundError();

    let uploadedImageKey: string | null = null;
    let nextImageKey = current.imageKey;

    if (image) {
      uploadedImageKey = createTeamImageKey(image.contentType);
      await uploadStoredObject(uploadedImageKey, image);
      nextImageKey = uploadedImageKey;
    } else if (removeImage) {
      nextImageKey = null;
    }

    let updated: AboutTeamMember;
    try {
      updated = await this.members.update(id, {
        ...input,
        ...(image || removeImage ? { imageKey: nextImageKey } : {}),
      });
    } catch (error) {
      await cleanupStoredImage(uploadedImageKey);
      throw error;
    }

    if (current.imageKey && current.imageKey !== updated.imageKey) {
      await cleanupStoredImage(current.imageKey);
    }

    return updated;
  }

  public async deleteTeamMember(id: string) {
    const current = await this.members.findById(id);
    if (!current) throw new AboutTeamMemberNotFoundError();

    await this.members.delete(id);
    await cleanupStoredImage(current.imageKey);
  }
}
