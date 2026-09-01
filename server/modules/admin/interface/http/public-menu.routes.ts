import type { FastifyInstance } from "fastify";

import type { MenuService } from "../../application/menu.service.js";

type PublicMenuRoutesOptions = {
  service: MenuService;
};

export async function publicMenuRoutes(app: FastifyInstance, options: PublicMenuRoutesOptions) {
  app.get("/api/menu", async () => ({ data: await options.service.getPublicNavigation() }));
}
