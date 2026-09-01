import { createHmac, timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../config/env.js";

export const ADMIN_SESSION_COOKIE = "limex_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export type AdminSession = {
  username: string;
  expiresAt: number;
};

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string) {
  return createHmac("sha256", env.ADMIN_SESSION_SECRET).update(value).digest("base64url");
}

function readCookie(request: FastifyRequest, name: string) {
  const header = request.headers.cookie;
  if (!header) return null;

  const pair = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : null;
}

export function credentialsMatch(username: string, password: string) {
  return safeCompare(username, env.ADMIN_USERNAME) && safeCompare(password, env.ADMIN_PASSWORD);
}

export function createAdminSession(username = env.ADMIN_USERNAME) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = Buffer.from(`${username}|${expiresAt}`).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function getAdminSession(request: FastifyRequest): AdminSession | null {
  const token = readCookie(request, ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeCompare(signature, sign(payload))) return null;

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const separatorIndex = decoded.lastIndexOf("|");
  if (separatorIndex < 1) return null;

  const username = decoded.slice(0, separatorIndex);
  const expiresAt = Number(decoded.slice(separatorIndex + 1));
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  if (!safeCompare(username, env.ADMIN_USERNAME)) return null;

  return { username, expiresAt };
}

export function requireAdminSession(request: FastifyRequest, reply: FastifyReply) {
  const session = getAdminSession(request);
  if (!session) {
    reply.code(401).send({ error: "Authentication required." });
    return null;
  }

  return session;
}

export function setAdminSession(reply: FastifyReply, token: string) {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  reply.header(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${token}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
  );
}

export function clearAdminSession(reply: FastifyReply) {
  reply.header(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
