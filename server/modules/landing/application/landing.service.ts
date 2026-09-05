import type { LandingContent, LandingRepository, LandingSectionKey } from "../domain/landing.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasAccidentalEmptyList(current: unknown, next: unknown): boolean {
  if (!isRecord(current) || !isRecord(next)) return false;

  return Object.entries(current).some(([key, currentValue]) => {
    const nextValue = next[key];

    if (Array.isArray(currentValue) && currentValue.length > 0 && Array.isArray(nextValue) && nextValue.length === 0) {
      return true;
    }

    if (isRecord(currentValue) && isRecord(nextValue)) {
      return hasAccidentalEmptyList(currentValue, nextValue);
    }

    if (Array.isArray(currentValue) && Array.isArray(nextValue)) {
      return currentValue.some((item, index) => hasAccidentalEmptyList(item, nextValue[index]));
    }

    return false;
  });
}

export class LandingConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(message = "This landing content changed in another session. Reload before saving.") {
    super(message);
    this.name = "LandingConflictError";
  }
}

export class LandingSafetyError extends Error {
  public readonly statusCode = 422;

  public constructor(message = "The update contains an empty list and was not saved. Reload the section and try again.") {
    super(message);
    this.name = "LandingSafetyError";
  }
}

export class LandingService {
  public constructor(private readonly landing: LandingRepository) {}

  public async getSnapshot() {
    const record = await this.landing.find();
    return {
      content: isRecord(record?.content) ? record.content as LandingContent : {} as LandingContent,
      updatedAt: record?.updatedAt ?? null,
    };
  }

  public async getContent(): Promise<LandingContent> {
    return (await this.getSnapshot()).content;
  }

  public async updateSection(section: LandingSectionKey, content: unknown, expectedUpdatedAt: Date): Promise<{ content: LandingContent; updatedAt: Date }> {
    const record = await this.landing.find();
    if (!record) throw new LandingConflictError("Landing content is not initialized. Run the database seed before saving.");
    if (record.updatedAt.getTime() !== expectedUpdatedAt.getTime()) throw new LandingConflictError();

    const current = isRecord(record.content) ? record.content as LandingContent : {} as LandingContent;
    if (hasAccidentalEmptyList(current[section], content)) throw new LandingSafetyError();

    const next = { ...current, [section]: content } as LandingContent;
    const saved = await this.landing.updateIfUnchanged(expectedUpdatedAt, next);
    if (!saved) throw new LandingConflictError();

    return {
      content: isRecord(saved.content) ? saved.content as LandingContent : next,
      updatedAt: saved.updatedAt,
    };
  }
}
