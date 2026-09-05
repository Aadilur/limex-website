import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { businessTools, calculatorFields, initialToolValues, type ToolsConfig } from "../src/lib/business-tools.js";
import { documentFields } from "../src/lib/business-documents.js";

const base = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const submissionId = randomUUID();
let savedId: string | undefined;
let cookie = "";
async function call(path: string, method = "GET", body?: unknown, admin = false) {
  const response = await fetch(`${base}${path}`, { method, headers: { "Content-Type": "application/json", ...(admin ? { Cookie: cookie } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000) });
  const payload = await response.json(); return { response, payload };
}
try {
  const loaded = await call("/api/tools/config"); assert.equal(loaded.response.status, 200); const config = loaded.payload.data as ToolsConfig;
  assert.equal(config.settings.companyRegistration.nameClearanceFee, 500);
  assert.equal(config.settings.companyRegistration.filingFee, 1200);
  assert.ok(config.settings.tradeLicense.dncc.tariffRows.length >= 100);
  assert.ok(config.settings.tradeLicense.dscc.tariffRows.length >= 100);
  assert.equal(config.settings.tradeLicense.dncc.signboardRates.identificationPerSqFt, 80);
  assert.equal(config.settings.tradeLicense.dscc.formFee, 50);
  assert.equal((await call("/api/admin/tools/requests")).response.status, 401);
  assert.equal((await call("/api/tools/calculate/vat", "POST", { values: { amount: "-5", rate: "15", mode: "Excluding VAT" } })).response.status, 400);
  for (const tool of businessTools) {
    if (tool.group === "calculator") {
      const fields = calculatorFields(tool.slug, config.settings);
      const values = { ...initialToolValues(fields), amount: "1000", income: "1200000", capital: "1000000", paidUp: "100000", paidUpCapital: "1000000", activity: "QA software services", ceiling: "500000", classes: "9,35", governmentFee: "5000", signboard: "0", signboardType: "No signboard / advertisement", advertisementType: "No additional advertisement", sourceTax: "0", arrears: "0", lateMonths: "0", tradeFee: "0", extras: "0", brandName: "Limex QA", name1: "Limex QA Limited" };
      for (const field of fields) if (!values[field.key] && field.kind !== "number") values[field.key] = `QA ${field.label}`;
      const result = await call(`/api/tools/calculate/${tool.slug}`, "POST", { values }); assert.equal(result.response.status, 200, `${tool.slug}: ${JSON.stringify(result.payload)}`); assert.ok(Number.isFinite(result.payload.data.result.total));
      if (tool.slug === "limited-company") {
        const rows = result.payload.data.result.rows as { label: string; amount: number | null }[];
        assert.equal(rows.find((row) => row.label === "RJSC filing fee · 6 documents")?.amount, config.settings.companyRegistration.filingFee);
        assert.equal(rows.find((row) => row.label === "Articles of Association stamp")?.amount, 2000);
      }
      if (tool.slug === "trade-license") {
        const rows = result.payload.data.result.rows as { label: string; amount: number | null }[];
        assert.equal(rows.find((row) => row.label === "Application form")?.amount, 0);
        assert.equal(rows.find((row) => row.label === "Licence book")?.amount, 270);
      }
    } else {
      const fields = documentFields(tool.slug); const values = initialToolValues(fields);
      for (const field of fields) if (!values[field.key]) values[field.key] = field.kind === "date" ? "2026-09-05" : field.kind === "number" ? field.key === "shareA" ? "50" : field.key === "months" ? "12" : "1000" : `QA ${field.label}`;
      const result = await call(`/api/tools/documents/${tool.slug}`, "POST", { values }); assert.equal(result.response.status, 200, `${tool.slug}: ${JSON.stringify(result.payload)}`); assert.ok(result.payload.data.draft.sections.length >= 5);
    }
  }
  const login = await call("/api/admin/auth/login", "POST", { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }); assert.equal(login.response.status, 200); cookie = login.response.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await call("/api/admin/tools/config", "GET", undefined, true)).response.status, 200);
  // Publish identical settings to verify persistence/CAS without changing any fees or rules.
  const published = await call("/api/admin/tools/config", "PUT", config, true); assert.equal(published.response.status, 200); assert.deepEqual(published.payload.data.settings, config.settings);
  assert.equal((await call("/api/admin/tools/config", "PUT", config, true)).response.status, 409);
  const requestBody = { submissionId, toolSlug: "vat", name: "Limex QA disposable check", phone: "00000000000", message: "Automated integration check; removed immediately after verification.", consent: true, website: "", values: { mode: "Excluding VAT", amount: "1000", rate: "15" } };
  const saved = await call("/api/tools/requests", "POST", requestBody); assert.equal(saved.response.status, 201); savedId = saved.payload.data.reference;
  const retried = await call("/api/tools/requests", "POST", requestBody); assert.equal(retried.response.status, 200); assert.equal(retried.payload.data.reference, savedId);
  const persisted = await prisma.toolServiceRequest.findUnique({ where: { id: savedId } }); assert.ok(persisted); assert.equal((persisted.context as any).result.total, 1150);
  assert.equal((await call(`/api/admin/tools/requests/${savedId}`, "PATCH", { status: "CONTACTED" }, true)).response.status, 200);
  assert.equal((await prisma.toolServiceRequest.findUnique({ where: { id: savedId } }))?.status, "CONTACTED");
  assert.equal((await call("/api/admin/tools/requests", "GET", undefined, true)).response.status, 200);
  const routes = await Promise.all(businessTools.map(async (tool) => { const result = await fetch(`${base}/business-tools/${tool.slug}`, { signal: AbortSignal.timeout(30000) }); return [tool.slug, result.status] as const; }));
  for (const [slug, status] of routes) assert.equal(status, 200, slug);
  assert.equal((await fetch(`${base}/business-tools/not-a-tool`)).status, 404);
  console.log("PASS: all 13 pages, seven calculators, six document endpoints, validation, admin protection, unchanged-settings publication, stale-version rejection, request persistence, idempotent retry and status updates.");
} finally {
  if (savedId) await prisma.toolServiceRequest.deleteMany({ where: { id: savedId, submissionId, name: "Limex QA disposable check" } });
  await prisma.$disconnect();
}
