import {
  ContactConflictError,
  ContactSafetyError,
  defaultContactSettings,
  toAdminContactSettings,
  toPublicContactSettings,
  type ContactRepository,
} from "../domain/contact.js";
import type { ContactSettingsInput } from "../../../../src/lib/contact-types.js";

function hasMeaningfulSettings(input: ContactSettingsInput) {
  return [input.whatsappNumber, input.email, input.phone, input.address, input.businessHours].some((value) => value.trim().length > 0);
}

export class ContactService {
  public constructor(private readonly contacts: ContactRepository) {}

  public async getAdminSettings() {
    const row = await this.contacts.find();
    return row ? toAdminContactSettings(row) : null;
  }

  public async getPublicSettings() {
    const row = await this.contacts.find();
    if (row) return toPublicContactSettings(row);

    return toPublicContactSettings({
      id: "default",
      revision: 0,
      ...defaultContactSettings,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    });
  }

  public async saveSettings(input: ContactSettingsInput, expectedRevision: number, updatedBy: string) {
    const current = await this.contacts.find();
    if (!current) {
      if (expectedRevision !== 0) throw new ContactConflictError("Contact settings are not initialized. Reload and try again.");
      const created = await this.contacts.create(input);
      return toAdminContactSettings(created);
    }

    if (current.revision !== expectedRevision) throw new ContactConflictError();
    if (!input.whatsappDisplay.trim() || !input.whatsappMessage.trim() || !input.email.trim()) {
      throw new ContactSafetyError("Keep the WhatsApp label, default message and email fields before saving.");
    }
    if (!hasMeaningfulSettings(input)) throw new ContactSafetyError("The contact settings were empty, so the existing details were kept safe.");

    const saved = await this.contacts.updateIfUnchanged(expectedRevision, input);
    if (!saved) throw new ContactConflictError();
    void updatedBy;
    return toAdminContactSettings(saved);
  }
}
