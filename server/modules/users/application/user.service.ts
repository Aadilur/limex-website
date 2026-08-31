import type {
  CreateUserInput,
  User,
  UserRepository,
} from "../domain/user.js";

export class UserService {
  public constructor(private readonly users: UserRepository) {}

  public listUsers(): Promise<User[]> {
    return this.users.findAll();
  }

  public createUser(input: CreateUserInput): Promise<User> {
    return this.users.create(input);
  }
}
