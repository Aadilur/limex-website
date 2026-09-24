export type AboutTeamMember = {
  id: string;
  name: string;
  title: string;
  description: string;
  imageKey: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAboutTeamMemberInput = {
  name: string;
  title: string;
  description: string;
  imageKey?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateAboutTeamMemberInput = Partial<CreateAboutTeamMemberInput>;

export interface AboutRepository {
  findAll(options?: { visibleOnly?: boolean }): Promise<AboutTeamMember[]>;
  findById(id: string): Promise<AboutTeamMember | null>;
  create(input: CreateAboutTeamMemberInput): Promise<AboutTeamMember>;
  update(id: string, input: UpdateAboutTeamMemberInput): Promise<AboutTeamMember>;
  delete(id: string): Promise<void>;
}

export type AboutReel = {
  id: string;
  youtubeUrl: string;
  videoId: string;
  title: string | null;
  youtubeTitle: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateAboutReelRecordInput = {
  youtubeUrl: string;
  videoId: string;
  title?: string | null;
  youtubeTitle?: string | null;
  sortOrder?: number;
  isVisible?: boolean;
};

export type UpdateAboutReelRecordInput = Partial<CreateAboutReelRecordInput>;

export interface AboutReelRepository {
  findAllReels(options?: { visibleOnly?: boolean }): Promise<AboutReel[]>;
  findReelById(id: string): Promise<AboutReel | null>;
  createReel(input: CreateAboutReelRecordInput): Promise<AboutReel>;
  updateReel(id: string, input: UpdateAboutReelRecordInput): Promise<AboutReel>;
  deleteReel(id: string): Promise<void>;
}
