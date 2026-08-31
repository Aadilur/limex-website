import type { FastifyInstance } from "fastify";

import type { HealthService } from "../../application/health.service.js";

type HealthRoutesOptions = {
  service: HealthService;
};

export async function healthRoutes(
  app: FastifyInstance,
  options: HealthRoutesOptions,
) {
  app.get("/api/health", async () => options.service.liveness());

  app.get("/api/health/ready", async (_request, reply) => {
    const result = await options.service.readiness();

    return reply
      .code(result.status === "ok" ? 200 : 503)
      .send(result);
  });
}
