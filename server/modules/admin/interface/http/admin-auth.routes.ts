import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { AdminAuthService } from "../../application/admin-auth.service.js";
import {
  clearAdminSession,
  requireAdminSession,
  setAdminSession,
} from "../../../../shared/auth/admin-session.js";
import { createRateLimiter } from "../../../../shared/http/rate-limit.js";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

type AdminAuthRoutesOptions = {
  service: AdminAuthService;
};

export async function adminAuthRoutes(app: FastifyInstance, options: AdminAuthRoutesOptions) {
  const loginLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60_000 });

  app.post("/api/admin/auth/login", { bodyLimit: 10_000 }, async (request, reply) => {
    if (!loginLimiter(request, reply, "admin-login")) return;
    const input = loginSchema.parse(request.body);
    const token = options.service.authenticate(input.username, input.password);

    if (!token) {
      return reply.code(401).send({ error: "Incorrect username or password." });
    }

    setAdminSession(reply, token);
    return { data: { username: input.username } };
  });

  app.get("/api/admin/auth/session", async (request, reply) => {
    const session = requireAdminSession(request, reply);
    if (!session) return;

    return { data: { username: session.username, expiresAt: session.expiresAt } };
  });

  app.post("/api/admin/auth/logout", async (_request, reply) => {
    clearAdminSession(reply);
    return { data: { loggedOut: true } };
  });
}
