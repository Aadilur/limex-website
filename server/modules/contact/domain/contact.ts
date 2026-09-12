import type { AdminContactSettings, ContactSettingsInput, PublicContactSettings } from "../../../../src/lib/contact-types.js";

export type ContactSettingsRow = {
  id: string;
  revision: number;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactRepository = {
  find(): Promise<ContactSettingsRow | null>;
  create(input: ContactSettingsInput): Promise<ContactSettingsRow>;
  updateIfUnchanged(expectedRevision: number, input: ContactSettingsInput): Promise<ContactSettingsRow | null>;
};

export const defaultContactSettings: ContactSettingsInput = {
  whatsappNumber: "",
  whatsappDisplay: "+880 1XXX XXXXXX",
  whatsappMessage: "Hello Limex, I would like to discuss a service.",
  email: "hello@yourbrand.com",
  phone: "",
  address: "Dhaka, Bangladesh",
  businessHours: "Sunday–Thursday · 9:00 AM–6:00 PM (Dhaka)",
};

export class ContactConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(message = "Contact settings changed in another session. Reload before saving.") {
    super(message);
    this.name = "ContactConflictError";
  }
}

export class ContactSafetyError extends Error {
  public readonly statusCode = 422;

  public constructor(message = "The contact update was incomplete and was not saved.") {
    super(message);
    this.name = "ContactSafetyError";
  }
}

export function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/[^0-9]/g, "");
  // wa.me expects an international number without the leading +. A local
  // number beginning with 0 would otherwise create a broken public action.
  if (digits.length < 8 || digits.startsWith("0")) return null;
  const text = message.trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function toPublicContactSettings(row: ContactSettingsRow): PublicContactSettings {
  return {
    whatsappDisplay: row.whatsappDisplay,
    whatsappUrl: buildWhatsAppUrl(row.whatsappNumber, row.whatsappMessage),
    email: row.email,
    phone: row.phone,
    address: row.address,
    businessHours: row.businessHours,
  };
}

export function toAdminContactSettings(row: ContactSettingsRow): AdminContactSettings {
  return {
    id: row.id,
    revision: row.revision,
    whatsappNumber: row.whatsappNumber,
    whatsappDisplay: row.whatsappDisplay,
    whatsappMessage: row.whatsappMessage,
    whatsappUrl: buildWhatsAppUrl(row.whatsappNumber, row.whatsappMessage),
    email: row.email,
    phone: row.phone,
    address: row.address,
    businessHours: row.businessHours,
    updatedAt: row.updatedAt.toISOString(),
  };
}
