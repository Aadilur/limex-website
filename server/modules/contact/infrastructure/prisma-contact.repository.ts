import type { PrismaClient } from "@prisma/client";

import type { ContactRepository, ContactSettingsRow } from "../domain/contact.js";
import type { ContactSettingsInput } from "../../../../src/lib/contact-types.js";

const contactId = "default";

function toRow(value: unknown) {
  return value as ContactSettingsRow;
}

export class PrismaContactRepository implements ContactRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async find() {
    const row = await this.client.contactSettings.findUnique({ where: { id: contactId } });
    return row ? toRow(row) : null;
  }

  public async create(input: ContactSettingsInput) {
    return toRow(await this.client.contactSettings.create({ data: { id: contactId, ...input, revision: 1 } }));
  }

  public async updateIfUnchanged(expectedRevision: number, input: ContactSettingsInput) {
    const result = await this.client.contactSettings.updateMany({
      where: { id: contactId, revision: expectedRevision },
      data: { ...input, revision: { increment: 1 } },
    });
    if (result.count !== 1) return null;
    return this.find();
  }
}
