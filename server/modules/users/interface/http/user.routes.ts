import { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { UserService } from "../../application/user.service.js";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(100).optional(),
});

type UserRoutesOptions = {
  service: UserService;
};

export async function userRoutes(
  app: FastifyInstance,
  options: UserRoutesOptions,
) {
  app.get("/api/users", async () => {
    const users = await options.service.listUsers();

    return { data: users };
  });

  app.post("/api/users", async (request, reply) => {
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
