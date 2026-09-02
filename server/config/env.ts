import "dotenv/config";

import { z } from "zod";

const defaultLocalSessionSecret = "limex-local-admin-session-secret";
const optionalEnv = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);
const optionalUrlEnv = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().url().optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(16).default(defaultLocalSessionSecret),
  BUCKET: optionalEnv,
  ENDPOINT: optionalUrlEnv,
  REGION: optionalEnv.default("auto"),
  ACCESS_KEY_ID: optionalEnv,
  SECRET_ACCESS_KEY: optionalEnv,
});

const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  BACKEND_PORT: process.env.BACKEND_PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  BUCKET: process.env.BUCKET,
  ENDPOINT: process.env.ENDPOINT,
  REGION: process.env.REGION,
  ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
});

if (parsedEnv.NODE_ENV === "production" && parsedEnv.ADMIN_SESSION_SECRET === defaultLocalSessionSecret) {
  throw new Error("ADMIN_SESSION_SECRET must be configured in production.");
}

export const env = parsedEnv;
