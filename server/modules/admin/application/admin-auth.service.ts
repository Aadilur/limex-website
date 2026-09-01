import type { FastifyRequest } from "fastify";

import {
  createAdminSession,
  credentialsMatch,
  getAdminSession,
  type AdminSession,
} from "../../../shared/auth/admin-session.js";

export class AdminAuthService {
  public authenticate(username: string, password: string) {
    return credentialsMatch(username, password) ? createAdminSession(username) : null;
  }

  public session(request: FastifyRequest): AdminSession | null {
    return getAdminSession(request);
  }
}
