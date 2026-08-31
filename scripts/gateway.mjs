import http from "node:http";

import "dotenv/config";
import httpProxy from "http-proxy";

const frontendPort = Number(process.env.FRONTEND_PORT ?? 3000);
const backendPort = Number(process.env.BACKEND_PORT ?? 4000);
const gatewayPort = Number(
  process.env.PORT ?? process.env.GATEWAY_PORT ?? 8080,
);

const frontendTarget = `http://127.0.0.1:${frontendPort}`;
const backendTarget = `http://127.0.0.1:${backendPort}`;
const proxy = httpProxy.createProxyServer({
  changeOrigin: false,
  ws: true,
  xfwd: true,
});

function isApiRequest(requestUrl = "/") {
  const pathname = new URL(requestUrl, "http://gateway.local").pathname;

  return pathname === "/api" || pathname.startsWith("/api/");
}

function targetFor(requestUrl) {
  return isApiRequest(requestUrl) ? backendTarget : frontendTarget;
}

proxy.on("error", (error, _request, response) => {
  console.error("Gateway proxy error:", error.message);

  if (response && typeof response.writeHead === "function" && !response.headersSent) {
    response.writeHead(502, { "content-type": "application/json" });
  }

  if (response && typeof response.end === "function") {
    response.end(JSON.stringify({ error: "Upstream service unavailable." }));
  }
});

const server = http.createServer((request, response) => {
  proxy.web(request, response, {
    target: targetFor(request.url),
  });
});

server.on("upgrade", (request, socket, head) => {
  proxy.ws(request, socket, head, {
    target: targetFor(request.url),
  });
});

server.listen(gatewayPort, "0.0.0.0", () => {
  console.log(
    `Gateway listening on ${gatewayPort}; frontend=${frontendPort}, backend=${backendPort}`,
  );
});
