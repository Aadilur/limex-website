import { spawn } from "node:child_process";

import "dotenv/config";

const frontendPort = process.env.FRONTEND_PORT ?? "3000";
const backendPort = process.env.BACKEND_PORT ?? "4000";
const gatewayPort = process.env.PORT ?? process.env.GATEWAY_PORT ?? "8080";
const baseEnvironment = { ...process.env, NODE_ENV: "production" };

function startProcess(command, args, environment = {}) {
  return spawn(command, args, {
    env: { ...baseEnvironment, ...environment },
    stdio: "inherit",
  });
}

const processes = [
  startProcess(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      frontendPort,
    ],
    { PORT: frontendPort },
  ),
  startProcess(process.execPath, ["dist/server/index.js"], {
    BACKEND_PORT: backendPort,
    PORT: backendPort,
  }),
  startProcess(process.execPath, ["scripts/gateway.mjs"], {
    BACKEND_PORT: backendPort,
    FRONTEND_PORT: frontendPort,
    GATEWAY_PORT: gatewayPort,
  }),
];

let shuttingDown = false;

function stopAll(exitCode = 0) {
  if (shuttingDown) return;

  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }

  setTimeout(() => process.exit(exitCode), 10_000).unref();
}

for (const child of processes) {
  child.once("exit", (code, signal) => {
    if (shuttingDown) return;

    console.error(
      `A production process exited (code=${code ?? "null"}, signal=${signal ?? "null"}).`,
    );
    stopAll(code && code > 0 ? code : 1);
  });
}

process.once("SIGINT", () => stopAll(0));
process.once("SIGTERM", () => stopAll(0));

console.log(
  `Production services starting: gateway=${gatewayPort}, frontend=${frontendPort}, backend=${backendPort}`,
);
