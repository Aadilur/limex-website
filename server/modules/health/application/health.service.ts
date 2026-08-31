export interface DatabaseHealthCheck {
  ping(): Promise<void>;
}

export type ReadinessResult = {
  status: "ok" | "degraded";
  service: "api";
  database: "up" | "down";
  timestamp: string;
};

export class HealthService {
  public constructor(private readonly database: DatabaseHealthCheck) {}

  public liveness() {
    return {
      status: "ok" as const,
      service: "api" as const,
      timestamp: new Date().toISOString(),
    };
  }

  public async readiness(): Promise<ReadinessResult> {
    try {
      await this.database.ping();

      return {
        status: "ok",
        service: "api",
        database: "up",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "degraded",
        service: "api",
        database: "down",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
