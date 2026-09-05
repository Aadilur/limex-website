import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { UserService } from "../../application/user.service.js";
import { createRateLimiter } from "../../../../shared/http/rate-limit.js";
import { requireAdminSession } from "../../../../shared/auth/admin-session.js";

const createUserSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(100).optional(),
}).strict();

type UserRoutesOptions = {
  service: UserService;
};

export async function userRoutes(
  app: FastifyInstance,
  options: UserRoutesOptions,
) {
  const createUserLimiter = createRateLimiter({ limit: 6, windowMs: 60_000 });

  app.get("/api/users", async (request, reply) => {
    if (!requireAdminSession(request, reply)) return;
    const users = await options.service.listUsers();

    return { data: users };
  });

  app.post("/api/users", { bodyLimit: 10_000 }, async (request, reply) => {
    if (!createUserLimiter(request, reply, "create-user")) return;
    const input = createUserSchema.parse(request.body);

    try {
      const user = await options.service.createUser(input);

      return reply.code(201).send({ data: user });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return reply.code(409).send({
          error: "A user with this email already exists.",
        });
      }

      throw error;
    }
  });
}
