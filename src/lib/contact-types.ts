export type PublicContactSettings = {
  whatsappDisplay: string;
  whatsappUrl: string | null;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
};

export type AdminContactSettings = PublicContactSettings & {
  id: string;
  revision: number;
  whatsappNumber: string;
  whatsappMessage: string;
  updatedAt: string | null;
};

export type ContactSettingsInput = {
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
};
