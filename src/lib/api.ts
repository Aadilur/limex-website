export type HealthResponse = {
  status: "ok";
  service: "api";
  timestamp: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("The API health check failed.");
  }

  return response.json() as Promise<HealthResponse>;
}
