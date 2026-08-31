export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  email: string;
  name?: string;
};

export interface UserRepository {
  findAll(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
}
