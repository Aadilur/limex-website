import type { PrismaClient } from "@prisma/client";

import type {
  AboutReel,
  AboutReelRepository,
  CreateAboutReelRecordInput,
  UpdateAboutReelRecordInput,
} from "../domain/about.js";

export class PrismaAboutReelRepository implements AboutReelRepository {
  public constructor(private readonly client: PrismaClient) {}

  public findAllReels(options: { visibleOnly?: boolean } = {}): Promise<AboutReel[]> {
    return this.client.aboutReel.findMany({
      where: options.visibleOnly ? { isVisible: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  public findReelById(id: string): Promise<AboutReel | null> {
    return this.client.aboutReel.findUnique({ where: { id } });
  }

  public createReel(input: CreateAboutReelRecordInput): Promise<AboutReel> {
    return this.client.aboutReel.create({
      data: {
        youtubeUrl: input.youtubeUrl,
        videoId: input.videoId,
        title: input.title ?? null,
        youtubeTitle: input.youtubeTitle ?? null,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public updateReel(id: string, input: UpdateAboutReelRecordInput): Promise<AboutReel> {
    return this.client.aboutReel.update({ where: { id }, data: input });
  }

  public async reorderReels(orderedIds: string[]): Promise<void> {
    await this.client.$transaction(
      orderedIds.map((id, sortOrder) =>
        this.client.aboutReel.update({ where: { id }, data: { sortOrder } }),
      ),
    );
  }

  public async deleteReel(id: string): Promise<void> {
    await this.client.aboutReel.delete({ where: { id } });
  }
}
