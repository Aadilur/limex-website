import type { PrismaClient } from "@prisma/client";

import type {
  AboutRepository,
  AboutTeamMember,
  CreateAboutTeamMemberInput,
  UpdateAboutTeamMemberInput,
} from "../domain/about.js";

export class PrismaAboutRepository implements AboutRepository {
  public constructor(private readonly client: PrismaClient) {}

  public findAll(options: { visibleOnly?: boolean } = {}): Promise<AboutTeamMember[]> {
    return this.client.aboutTeamMember.findMany({
      where: options.visibleOnly ? { isVisible: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  public findById(id: string): Promise<AboutTeamMember | null> {
    return this.client.aboutTeamMember.findUnique({ where: { id } });
  }

  public create(input: CreateAboutTeamMemberInput): Promise<AboutTeamMember> {
    return this.client.aboutTeamMember.create({
      data: {
        name: input.name,
        title: input.title,
        description: input.description,
        imageKey: input.imageKey ?? null,
        sortOrder: input.sortOrder ?? 0,
        isVisible: input.isVisible ?? true,
      },
    });
  }

  public update(id: string, input: UpdateAboutTeamMemberInput): Promise<AboutTeamMember> {
    return this.client.aboutTeamMember.update({ where: { id }, data: input });
  }

  public async delete(id: string): Promise<void> {
    await this.client.aboutTeamMember.delete({ where: { id } });
  }
}
