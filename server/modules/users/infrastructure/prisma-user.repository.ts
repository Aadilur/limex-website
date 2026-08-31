import type { PrismaClient } from "@prisma/client";

import type {
  CreateUserInput,
  User,
  UserRepository,
} from "../domain/user.js";

export class PrismaUserRepository implements UserRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async findAll(): Promise<User[]> {
    return this.client.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  public async create(input: CreateUserInput): Promise<User> {
    return this.client.user.create({
      data: {
        email: input.email,
        name: input.name,
      },
    });
  }
}
