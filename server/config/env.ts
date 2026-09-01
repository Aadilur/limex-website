import "dotenv/config";

import { z } from "zod";

const defaultLocalSessionSecret = "limex-local-admin-session-secret";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(16).default(defaultLocalSessionSecret),
});

const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_PORT: process.env.BACKEND_PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
});

if (parsedEnv.NODE_ENV === "production" && parsedEnv.ADMIN_SESSION_SECRET === defaultLocalSessionSecret) {
  throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
}

export const env = parsedEnv;
