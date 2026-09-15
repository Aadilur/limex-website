"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";
import {
  businessTools,
  money,
  taxCategoryLabels,
  toolsSettingsSchema,
  type ToolsConfig,
  type ToolsSettings,
} from "@/lib/business-tools";
import { request } from "@/lib/menu-api";
import { FeeSettingsEditor, type FeeSlug } from "./fee-settings-editor";
import { TemplateBuilderModule } from "./template-builder-module";
import styles from "../limex/tools.module.css";

export type ServiceRequest = {
  id: string;
  toolSlug: string;
  name: string;
  phone: string | null;
  email: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  requestType: string;
  message: string;
  status: string;
  createdAt: string;
  context: {
    type?: string;
    services?: string[];
    values?: Record<string, string>;
    result?: {
      title: string;
      total: number;
      rows?: { label: string; amount: number | null }[];
    };
    draft?: { title: string; sections: { heading: string; body: string }[] };
    configVersion?: number;
  };
};

export const statuses = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED"] as const;
export const labelStatus = (value: string) => value.toLowerCase().replaceAll("_", " ");
export const displayStatus = (value: string) =>
  labelStatus(value).replace(/^./, (character) => character.toUpperCase());

function requestSourceLabel(toolSlug: string) {
  if (toolSlug === "contact") return "Website contact form";
  return (
    businessTools.find((tool) => tool.slug === toolSlug)?.title ?? toolSlug
  );
}

function requestDateLabel(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function whatsappUrl(phone: string, name: string) {
  const cleanPhone = phone.replace(/[^+\d]/g, "");
  const text = encodeURIComponent(
    `Hello ${name}, this is Limex regarding your service request.`,
  );
  return `https://wa.me/${cleanPhone.replace(/^\+/, "")}?text=${text}`;
}

function statusStyle(status: string) {
  switch (status) {
    case "NEW":
      return "border-[#b8d5ff] bg-[#eff6ff] text-[#1d4ed8]";
    case "CONTACTED":
      return "border-[#e0d0fa] bg-[#faf5ff] text-[#7e22ce]";
    case "IN_PROGRESS":
      return "border-[#fedaa6] bg-[#fffbeb] text-[#b45309]";
    case "COMPLETED":
      return "border-[#bfe6cc] bg-[#f0fdf4] text-[#15803d]";
    default:
      return "border-[#dcd6cc] bg-[#f5f2eb] text-[#55504a]";
  }
}

function PhoneIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function MailIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CalendarIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ChevronDownIcon({ className = "size-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.4}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export function RequestDetailDrawer({
  item,
  copiedId,
  onCopy,
}: {
  item: ServiceRequest;
  copiedId: string | null;
  onCopy: (id: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-[16px] border border-[#e2dcd3] bg-white p-4.5 sm:p-5 shadow-[0_2px_8px_rgba(35,54,41,0.03)]">
      {/* Reference & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee9e2] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8c857b]">
            Reference
          </span>
          <code className="rounded-[6px] bg-[#f4f2ee] px-2 py-0.5 text-[11.5px] font-mono text-[#37332d]">
            {item.id}
          </code>
          <button
            type="button"
            className="text-[11px] font-semibold text-[#0055ff] transition-colors hover:underline"
            onClick={() => onCopy(item.id)}
          >
            {copiedId === item.id ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {item.phone ? (
            <>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d2d9cc] bg-[#f7faf5] px-3 py-1 text-[11.5px] font-semibold text-[#294d3f] transition-colors hover:bg-[#edf5e9]"
                href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
              >
                <PhoneIcon /> Call
              </a>
              <a
                className="inline-flex items-center gap-1.5 rounded-full border border-[#bde8ca] bg-[#eefaf2] px-3 py-1 text-[11.5px] font-semibold text-[#1a6e38] transition-colors hover:bg-[#dff5e6]"
                href={whatsappUrl(item.phone, item.name)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon /> WhatsApp
              </a>
            </>
          ) : null}
          {item.email ? (
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-3 py-1 text-[11.5px] font-semibold text-[#4f4b47] transition-colors hover:border-[#aaa197]"
              href={`mailto:${item.email}`}
            >
              <MailIcon /> Email client
            </a>
          ) : null}
        </div>
      </div>

      {/* Schedule highlight if present */}
      {item.preferredDate || item.preferredTime ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[#d8e5d3] bg-[#f1f8ed] px-3.5 py-2.5 text-[12px] text-[#2e5239]">
          <strong className="font-semibold">Preferred meeting schedule:</strong>
          <span>{item.preferredDate ?? "Date to be confirmed"}</span>
          <span>·</span>
          <span>
            {item.preferredTime ?? "Time to be confirmed"} (Dhaka time)
          </span>
        </div>
      ) : null}

      {/* Client Message */}
      {item.message ? (
        <div className="rounded-[12px] border border-[#eae5dd] bg-[#faf8f5] p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8c857b]">
            Client Message
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-[1.65] text-[#2c2824]">
            {item.message}
          </p>
        </div>
      ) : null}

      {/* Requested Services */}
      {item.context.services?.length ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8c857b]">
            Requested Services
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.context.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-[#d2e2fe] bg-[#f0f4ff] px-2.5 py-1 text-[11.5px] font-semibold text-[#0055ff]"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Calculation result if present */}
      {item.context.result ? (
        <div className="rounded-[12px] border border-[#cbe4d4] bg-[#f3faf5] p-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[13px] font-bold text-[#1e5835]">
              {item.context.result.title}
            </span>
            <span className="font-brand text-[18px] font-bold text-[#1e5835]">
              {money(item.context.result.total)}
            </span>
          </div>
          {item.context.result.rows?.length ? (
            <div className="mt-2.5 divide-y divide-[#dbeef2] border-t border-[#dbeef2] pt-2">
              {item.context.result.rows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex justify-between py-1 text-[11.5px] text-[#345942]"
                >
                  <span>{row.label}</span>
                  <span className="font-semibold">
                    {row.amount !== null ? money(row.amount) : "To confirm"}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Calculator Values */}
      {item.context.values && Object.keys(item.context.values).length > 0 ? (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8c857b]">
            Submitted Parameters
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(item.context.values).map(([key, value]) => (
              <div
                key={key}
                className="rounded-[10px] border border-[#ebe5dc] bg-[#faf8f5] px-3 py-2"
              >
                <p className="text-[10.5px] font-medium text-[#7c756c]">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-semibold text-[#1c191d]">
                  {value || "Not provided"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Submitted document draft */}
      {item.context.draft ? (
        <details className="rounded-[12px] border border-[#e4ded6] bg-[#faf8f5] p-3.5">
          <summary className="cursor-pointer text-[12.5px] font-bold text-[#294d3f]">
            Submitted document draft: {item.context.draft.title}
          </summary>
          <div className="mt-3 space-y-3 border-t border-[#eae5dd] pt-3">
            {item.context.draft.sections.map((section) => (
              <div
                key={section.heading}
                className="rounded-[10px] border border-[#ebe6df] bg-white p-3"
              >
                <h4 className="text-[12px] font-bold text-[#37332d]">
                  {section.heading}
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-[11.5px] leading-relaxed text-[#605a52]">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {!item.context.values &&
      !item.context.result &&
      !item.context.draft &&
      !item.context.services?.length &&
      !item.message ? (
        <p className="text-[11.5px] text-[#7b8579]">
          No additional calculator or document details were shared with this
          request.
        </p>
      ) : null}
    </div>
  );
}

export function ServiceRequestsTable({
  items,
  busy,
  expanded,
  onToggle,
  onUpdateStatus,
}: {
  items: ServiceRequest[];
  busy: boolean;
  expanded: string;
  onToggle: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyReference(id: string) {
    void navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Desktop & Tablet Table View */}
      <div className="hidden overflow-hidden rounded-[20px] border border-[#e2e7dd] bg-white shadow-[0_1px_3px_rgba(35,54,41,0.03)] md:block">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e9ede5] bg-[#fafbf8] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6e7769]">
                <th className="py-3.5 pl-5 pr-4">Client / Contact</th>
                <th className="px-4 py-3.5">Source Tool</th>
                <th className="px-4 py-3.5">Contact Channel</th>
                <th className="px-4 py-3.5">Schedule / Inquiry</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="py-3.5 pl-4 pr-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ea] text-[13px]">
              {items.map((item) => {
                const isExpanded = expanded === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={`transition-colors hover:bg-[#fafbf8] ${isExpanded ? "bg-[#f9faf7]" : "bg-white"}`}
                    >
                      {/* Column 1: Client & Type */}
                      <td className="py-3.5 pl-5 pr-4 align-top">
                        <div className="flex items-start gap-3">
                          <span
                            className="grid size-9 shrink-0 place-items-center rounded-full border border-[#006dce]/10 bg-[#e8f3ff] text-[13px] font-bold text-[#006dce]"
                            aria-hidden="true"
                          >
                            {item.name.trim().charAt(0).toUpperCase() || "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#071b3d]">
                              {item.name || "Anonymous Client"}
                            </p>
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${
                                item.requestType === "APPOINTMENT"
                                  ? "border border-[#fee4e2] bg-[#fef3f2] text-[#b42318]"
                                  : "border border-[#dcfce7] bg-[#f0fdf4] text-[#166534]"
                              }`}
                            >
                              {item.requestType === "APPOINTMENT"
                                ? "Appointment"
                                : "Callback"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Tool / Origin */}
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-semibold text-[#1c191d]">
                          {requestSourceLabel(item.toolSlug)}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#78716c]">
                          {requestDateLabel(item.createdAt)}
                        </p>
                      </td>

                      {/* Column 3: Contact Details */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="space-y-1 text-[12px]">
                          {item.phone ? (
                            <a
                              className="flex items-center gap-1.5 font-medium text-[#2d503b] transition-colors hover:text-[#0055ff] hover:underline"
                              href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
                            >
                              <PhoneIcon />
                              <span>{item.phone}</span>
                            </a>
                          ) : null}
                          {item.email ? (
                            <a
                              className="flex items-center gap-1.5 truncate font-medium text-[#2d503b] transition-colors hover:text-[#0055ff] hover:underline"
                              href={`mailto:${item.email}`}
                              title={item.email}
                            >
                              <MailIcon />
                              <span className="max-w-[170px] truncate">
                                {item.email}
                              </span>
                            </a>
                          ) : null}
                          {!item.phone && !item.email ? (
                            <span className="text-[11.5px] font-medium text-[#b42318]">
                              No channel provided
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Column 4: Schedule / Inquiry preview */}
                      <td className="px-4 py-3.5 align-top">
                        {item.preferredDate || item.preferredTime ? (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#dce8d6] bg-[#f1f8ed] px-2.5 py-1 text-[11px] font-medium text-[#2d503b]">
                            <CalendarIcon />
                            <span>
                              {item.preferredDate ?? "Date TBD"} ·{" "}
                              {item.preferredTime ?? "Time TBD"}
                            </span>
                          </div>
                        ) : item.message ? (
                          <p
                            className="max-w-[190px] truncate text-[12px] italic text-[#6b665f]"
                            title={item.message}
                          >
                            &ldquo;{item.message}&rdquo;
                          </p>
                        ) : item.context.services?.length ? (
                          <span className="rounded-full border border-[#d2e2fe] bg-[#f0f4ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#0055ff]">
                            {item.context.services.length} service
                            {item.context.services.length === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-[#9b958c]">
                            Standard request
                          </span>
                        )}
                      </td>

                      {/* Column 5: Status pill dropdown */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="relative inline-flex items-center">
                          <select
                            className={`min-h-8 cursor-pointer appearance-none rounded-full border px-3 pr-7 text-[11.5px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all focus:outline-none focus:ring-2 focus:ring-[#0055ff]/20 ${statusStyle(
                              item.status,
                            )}`}
                            value={item.status}
                            disabled={busy}
                            onChange={(event) =>
                              onUpdateStatus(item.id, event.target.value)
                            }
                          >
                            {statuses.map((value) => (
                              <option
                                value={value}
                                key={value}
                                className="bg-white text-[#1c191d]"
                              >
                                {displayStatus(value)}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70">
                            <ChevronDownIcon />
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3.5 pl-4 pr-5 text-right align-top">
                        <button
                          type="button"
                          className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[11.5px] font-semibold transition-all ${
                            isExpanded
                              ? "border-[#071b3d] bg-[#071b3d] text-white"
                              : "border-[#d8d2c8] bg-white text-[#4f4b47] hover:border-[#aaa197] hover:bg-[#faf8f5] hover:text-[#071b3d]"
                          }`}
                          aria-expanded={isExpanded}
                          onClick={() => onToggle(item.id)}
                        >
                          <span>{isExpanded ? "Close" : "Details"}</span>
                          <svg
                            className={`size-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    {/* Sub-row when expanded */}
                    {isExpanded ? (
                      <tr className="border-b border-t border-[#e2e7dd] bg-[#fafbf7]">
                        <td colSpan={6} className="p-4 sm:p-5">
                          <RequestDetailDrawer
                            item={item}
                            copiedId={copiedId}
                            onCopy={copyReference}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Table Cards (Visible on screens < md) */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const isExpanded = expanded === item.id;
          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[18px] border border-[#dfe4da] bg-white shadow-[0_2px_8px_rgba(35,54,41,0.04)]"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f3ff] text-[13px] font-bold text-[#006dce]"
                      aria-hidden="true"
                    >
                      {item.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div>
                      <h3 className="font-bold text-[#071b3d]">
                        {item.name || "Anonymous Client"}
                      </h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] ${
                          item.requestType === "APPOINTMENT"
                            ? "border border-[#fee4e2] bg-[#fef3f2] text-[#b42318]"
                            : "border border-[#dcfce7] bg-[#f0fdf4] text-[#166534]"
                        }`}
                      >
                        {item.requestType === "APPOINTMENT"
                          ? "Appointment"
                          : "Callback"}
                      </span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <select
                      className={`min-h-8 cursor-pointer appearance-none rounded-full border px-3 pr-7 text-[11px] font-semibold ${statusStyle(
                        item.status,
                      )}`}
                      value={item.status}
                      disabled={busy}
                      onChange={(event) =>
                        onUpdateStatus(item.id, event.target.value)
                      }
                    >
                      {statuses.map((value) => (
                        <option
                          value={value}
                          key={value}
                          className="bg-white text-[#1c191d]"
                        >
                          {displayStatus(value)}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70">
                      <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-1.5 border-t border-[#f0f2ed] pt-3 text-[12px]">
                  <p className="text-[#78716c]">
                    <strong className="font-semibold text-[#37332d]">
                      {requestSourceLabel(item.toolSlug)}
                    </strong>{" "}
                    · {requestDateLabel(item.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#2d503b]">
                    {item.phone ? (
                      <a
                        className="flex items-center gap-1 font-medium hover:underline"
                        href={`tel:${item.phone.replace(/[^+\d]/g, "")}`}
                      >
                        <PhoneIcon /> {item.phone}
                      </a>
                    ) : null}
                    {item.email ? (
                      <a
                        className="flex max-w-[220px] items-center gap-1 truncate font-medium hover:underline"
                        href={`mailto:${item.email}`}
                      >
                        <MailIcon /> {item.email}
                      </a>
                    ) : null}
                  </div>
                </div>

                {item.preferredDate || item.preferredTime ? (
                  <div className="mt-3 flex items-center gap-1.5 rounded-[10px] bg-[#f1f8ed] px-3 py-1.5 text-[11px] text-[#2d503b]">
                    <CalendarIcon />
                    <span>
                      {item.preferredDate ?? "Date TBD"} ·{" "}
                      {item.preferredTime ?? "Time TBD"}
                    </span>
                  </div>
                ) : null}

                <div className="mt-3 flex justify-end border-t border-[#f0f2ed] pt-2.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0055ff] hover:underline"
                    onClick={() => onToggle(item.id)}
                  >
                    <span>
                      {isExpanded ? "Hide details" : "View shared details"}
                    </span>
                    <svg
                      className={`size-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="border-t border-[#dfe4da] bg-[#fafbf7] p-4">
                  <RequestDetailDrawer
                    item={item}
                    copiedId={copiedId}
                    onCopy={copyReference}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function TablePagination({
  page,
  pageSize = 20,
  total,
  onPageChange,
  itemName = "item",
}: {
  page: number;
  pageSize?: number;
  total: number;
  onPageChange: (newPage: number) => void;
  itemName?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ede3] pt-4"
      aria-label="Table pagination"
    >
      <div className="text-[12px] font-medium text-[#736d64]">
        {total === 0 ? (
          <span>No {itemName}s</span>
        ) : (
          <span>
            Showing{" "}
            <strong className="font-semibold text-[#071b3d]">{startItem}</strong>
            –
            <strong className="font-semibold text-[#071b3d]">{endItem}</strong> of{" "}
            <strong className="font-semibold text-[#071b3d]">{total}</strong>{" "}
            {total === 1 ? itemName : `${itemName}s`}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d6dbcf] bg-white px-3 sm:px-4 text-[12px] font-semibold text-[#4f4b47] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#aaa197] hover:bg-[#faf8f5] disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={p}
                type="button"
                className={`grid size-8 sm:size-9 place-items-center rounded-full text-[12px] font-semibold transition-all ${
                  p === page
                    ? "border border-[#071b3d] bg-[#071b3d] text-white shadow-sm"
                    : "border border-[#d6dbcf] bg-white text-[#4f4b47] hover:border-[#aaa197] hover:bg-[#faf8f5]"
                }`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ) : (
              <span
                key={`dots-${idx}`}
                className="grid size-7 sm:size-8 place-items-center text-[12px] text-[#9b958c]"
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d6dbcf] bg-white px-3 sm:px-4 text-[12px] font-semibold text-[#4f4b47] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#aaa197] hover:bg-[#faf8f5] disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

const taxNumbers = [
  ["salaryExemptionCap", "Employment exemption cap (৳)"],
  ["rebateInvestmentRate", "Eligible-investment rebate rate (%)"],
  ["rebateIncomeRate", "Eligible-income rebate limit (%)"],
  ["rebateCap", "Maximum rebate (৳)"],
  ["minimumTax", "Minimum tax (৳)"],
  ["newTaxpayerMinimum", "New taxpayer minimum (৳)"],
  ["childAllowance", "Allowance per eligible child (৳)"],
] as const;

export function ToolsAdminModule() {
  const [tab, setTab] = useState("requests");
  const [config, setConfig] = useState<ToolsConfig | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [requestSearchInput, setRequestSearchInput] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [expanded, setExpanded] = useState("");
  const [reload, setReload] = useState(0);
  const [yearIndex, setYearIndex] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [feeSlug, setFeeSlug] = useState<FeeSlug>("limited-company");

  useEffect(() => {
    let active = true;
    void request<ToolsConfig>("/api/admin/tools/config", { cache: "no-store" })
      .then((data) => {
        if (active) {
          setConfig(data);
          setDirty(false);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  useEffect(() => {
    if (tab !== "requests") return;
    let active = true;
    setError("");
    setItems([]);
    setRequestsLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (requestSearch) params.set("search", requestSearch);
    void request<{ items: ServiceRequest[]; total: number }>(
      `/api/admin/tools/requests?${params.toString()}`,
      { cache: "no-store" },
    )
      .then((data) => {
        if (active) {
          setItems(data.items);
          setTotal(data.total);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setRequestsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, page, status, requestSearch, reload]);

  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);

  function updateSettings(update: (settings: ToolsSettings) => ToolsSettings) {
    setConfig((current) =>
      current ? { ...current, settings: update(current.settings) } : current,
    );
    setDirty(true);
    setNotice("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!config || busy) return;
    setError("");
    setNotice("");
    const parsed = toolsSettingsSchema.safeParse(config.settings);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((issue) => `${issue.path.join(" → ")}: ${issue.message}`)
          .join("\n"),
      );
      return;
    }
    setBusy(true);
    try {
      const updated = await request<ToolsConfig>("/api/admin/tools/config", {
        method: "PUT",
        body: JSON.stringify({ ...config, settings: parsed.data }),
      });
      setConfig(updated);
      setDirty(false);
      setNotice(
        "Settings published. New calculations use this version; existing requests keep their original snapshot.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, next: string) {
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/tools/requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: next } : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update request.",
      );
    } finally {
      setBusy(false);
    }
  }

  const year = config?.settings.taxYears[yearIndex];
  function updateYear(key: string, value: unknown) {
    updateSettings((settings) => ({
      ...settings,
      taxYears: settings.taxYears.map((item, index) =>
        index === yearIndex ? { ...item, [key]: value } : item,
      ),
    }));
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
            Calculators & requests
          </p>
          <h1 className="mt-2 font-brand text-[32px] font-bold tracking-[-.03em] text-[#071b3d] sm:text-[38px]">
            Business tools
          </h1>
          <p className="mt-2 text-[13px] text-[#687063]">
            Manage calculators, document templates, fees and requests in one
            focused workspace.
          </p>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-all hover:border-[#aaa197] hover:text-[#071b3d]"
          href="/business-tools"
          target="_blank"
          rel="noreferrer"
        >
          <span>Open tools</span>
          <svg
            className="size-3.5 text-[#8b857e]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="mb-7 flex gap-1 overflow-x-auto border-b border-[#d6dbcf] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ["requests", "Service requests"],
          ["templates", "Document templates"],
          ["fees", "Fee settings"],
          ["tax", "Income tax rules"],
        ].map(([key, label]) => (
          <button
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-t-[10px] border-b-2 px-3.5 text-left text-[12.5px] font-semibold transition-colors ${
              tab === key
                ? "border-[#0055ff] text-[#0055ff]"
                : "border-transparent text-[#727a71] hover:border-[#a8b8a5] hover:text-[#071b3d]"
            }`.trim()}
            type="button"
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setNotice("");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          className={`${styles.error} mb-5 whitespace-pre-line rounded-[14px]`}
          role="alert"
        >
          {error}
          <button
            className={styles.quiet}
            type="button"
            onClick={() => {
              if (
                !dirty ||
                window.confirm("Discard unsaved settings and reload?")
              ) {
                setError("");
                setYearIndex(0);
                setReload((value) => value + 1);
              }
            }}
          >
            Reload
          </button>
        </div>
      ) : null}

      {notice ? (
        <p
          className="mb-5 rounded-[14px] border border-[#c1d5ba] bg-[#edf5e9] p-4 text-[13px] text-[#355b36]"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {tab === "templates" ? (
        <TemplateBuilderModule />
      ) : tab === "requests" ? (
        <>
          {/* Controls toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setRequestSearch(requestSearchInput.trim());
                }}
              >
                <div className="relative">
                  <input
                    type="text"
                    className="min-h-10 w-[200px] sm:w-[240px] rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] pl-9 pr-3.5 text-[12.5px] font-medium text-[#1c191d] placeholder:text-[#9b958c] outline-none transition-all hover:border-[#c5bdb2] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                    placeholder="Search requests…"
                    value={requestSearchInput}
                    onChange={(e) => setRequestSearchInput(e.target.value)}
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8c857b]">
                    <svg
                      className="size-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="min-h-10 rounded-[12px] border border-[#d8d2c8] bg-white px-3.5 text-[12px] font-semibold text-[#4f4b47] transition-all hover:border-[#aaa197] hover:bg-[#faf8f5]"
                >
                  Search
                </button>
              </form>

              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#37332d]">
                <span>Status</span>
                <div className="relative">
                  <select
                    className="min-h-10 cursor-pointer appearance-none rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] pl-3.5 pr-8 text-[12.5px] font-semibold text-[#1c191d] outline-none transition-all hover:border-[#c5bdb2] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All requests</option>
                    {statuses.map((value) => (
                      <option key={value} value={value}>
                        {displayStatus(value)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c857b]">
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </label>
              <span className="rounded-full bg-[#f0eee9] px-2.5 py-1 text-[11px] font-semibold text-[#676159]">
                {total} request{total === 1 ? "" : "s"}
              </span>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-4 text-[12px] font-bold text-[#4f4b47] transition-all hover:border-[#aaa197] hover:bg-[#faf8f5] hover:text-[#071b3d]"
              onClick={() => setReload((value) => value + 1)}
            >
              <svg
                className="size-3.5 text-[#706a62]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh inbox</span>
            </button>
          </div>

          {/* Table content */}
          {requestsLoading ? (
            <div
              className="grid min-h-[220px] place-items-center rounded-[20px] border border-[#e2e7dd] bg-white text-[13px] font-semibold text-[#778175]"
              role="status"
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="size-6 animate-spin text-[#0055ff]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Loading service requests…</span>
              </div>
            </div>
          ) : items.length ? (
            <ServiceRequestsTable
              items={items}
              busy={busy}
              expanded={expanded}
              onToggle={(id) =>
                setExpanded((current) => (current === id ? "" : id))
              }
              onUpdateStatus={(id, next) => void updateStatus(id, next)}
            />
          ) : !error ? (
            <div className="rounded-[20px] border border-dashed border-[#dcd5cb] bg-white px-4 py-12 text-center text-[13px] text-[#778175]">
              No service requests found for this filter.
            </div>
          ) : null}

          {/* Pagination controls */}
          <TablePagination
            page={page}
            pageSize={20}
            total={total}
            onPageChange={(newPage) => setPage(newPage)}
            itemName="request"
          />
        </>
      ) : !config ? (
        <p className={styles.muted}>Loading settings…</p>
      ) : (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="min-w-0">
            {tab === "fees" ? (
              <div className="grid gap-5">
                <p className={styles.muted}>
                  Choose one service to edit its fees and rules. Blank means “to
                  confirm”; enter 0 only when a charge is genuinely zero. Your
                  edits remain a draft until you publish settings.
                </p>
                <FeeSettingsEditor
                  settings={config.settings}
                  busy={busy}
                  slug={feeSlug}
                  onSlugChange={setFeeSlug}
                  updateSettings={updateSettings}
                />
              </div>
            ) : year ? (
              <div className="grid gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-3 text-[13px]">
                    Assessment year
                    <select
                      className={styles.control}
                      value={yearIndex}
                      onChange={(event) =>
                        setYearIndex(Number(event.target.value))
                      }
                    >
                      {config.settings.taxYears.map((item, index) => (
                        <option key={index} value={index}>
                          {item.year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={styles.quiet}
                    onClick={() => {
                      if (config.settings.taxYears.length >= 10) return;
                      updateSettings((settings) => ({
                        ...settings,
                        taxYears: [
                          ...settings.taxYears,
                          {
                            ...year,
                            year: `${Number(year.year.slice(0, 4)) + 1}-${String(
                              (Number(year.year.slice(5)) + 1) % 100,
                            ).padStart(2, "0")}`,
                          },
                        ],
                      }));
                      setYearIndex(config.settings.taxYears.length);
                    }}
                  >
                    Add next year from these rules
                  </button>
                </div>
                <section className={styles.formPanel}>
                  <h2 className={`${styles.panelTitle} mb-6`}>
                    Tax-free thresholds
                  </h2>
                  <div className={styles.fields}>
                    <label className={styles.field}>
                      <span className={styles.label}>Year (YYYY-YY)</span>
                      <input
                        className={styles.control}
                        required
                        pattern="[0-9]{4}-[0-9]{2}"
                        value={year.year}
                        onChange={(event) =>
                          updateYear("year", event.target.value)
                        }
                      />
                    </label>
                    {Object.entries(year.thresholds).map(([key, value]) => (
                      <label key={key} className={styles.field}>
                        <span className={styles.label}>
                          {
                            taxCategoryLabels[
                              key as keyof typeof taxCategoryLabels
                            ]
                          }{" "}
                          (৳)
                        </span>
                        <input
                          className={styles.control}
                          type="number"
                          min={0}
                          required
                          value={value}
                          onChange={(event) =>
                            updateYear("thresholds", {
                              ...year.thresholds,
                              [key]: Number(event.target.value),
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                </section>
                <section className={styles.formPanel}>
                  <h2 className={`${styles.panelTitle} mb-3`}>
                    Progressive bands
                  </h2>
                  <p className={`${styles.muted} mb-5`}>
                    Band widths start after the category’s tax-free threshold.
                    The final band covers all remaining income.
                  </p>
                  {year.bands.map((band, index) => (
                    <div key={index} className="mb-5 grid grid-cols-2 gap-4">
                      <label className={styles.field}>
                        <span className={styles.label}>
                          {index === year.bands.length - 1
                            ? "Remaining income"
                            : `Band ${index + 1} width (৳)`}
                        </span>
                        <input
                          className={styles.control}
                          type={band.width === null ? "text" : "number"}
                          value={band.width ?? "Unlimited"}
                          disabled={band.width === null}
                          min={1}
                          required
                          onChange={(event) =>
                            updateYear(
                              "bands",
                              year.bands.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      width: Number(event.target.value),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.label}>Rate (%)</span>
                        <input
                          className={styles.control}
                          type="number"
                          required
                          min={0}
                          max={100}
                          step="0.01"
                          value={band.rate}
                          onChange={(event) =>
                            updateYear(
                              "bands",
                              year.bands.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      rate: Number(event.target.value),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                  ))}
                  <button
                    className={styles.quiet}
                    type="button"
                    disabled={year.bands.length >= 10}
                    onClick={() =>
                      updateYear("bands", [
                        ...year.bands.slice(0, -1),
                        { width: 100000, rate: year.bands.at(-1)!.rate },
                        year.bands.at(-1)!,
                      ])
                    }
                  >
                    Add a band
                  </button>
                  <button
                    className={styles.quiet}
                    type="button"
                    disabled={year.bands.length <= 1}
                    onClick={() =>
                      updateYear("bands", [
                        ...year.bands.slice(0, -2),
                        year.bands.at(-1)!,
                      ])
                    }
                  >
                    Remove last finite band
                  </button>
                </section>
                <section className={styles.formPanel}>
                  <h2 className={`${styles.panelTitle} mb-6`}>
                    Rebates and adjustments
                  </h2>
                  <div className={styles.fields}>
                    {taxNumbers.map(([key, label]) => (
                      <label className={styles.field} key={key}>
                        <span className={styles.label}>{label}</span>
                        <input
                          className={styles.control}
                          type="number"
                          required
                          min={0}
                          step="0.01"
                          value={year[key]}
                          onChange={(event) =>
                            updateYear(key, Number(event.target.value))
                          }
                        />
                      </label>
                    ))}
                    <label className={`${styles.field} ${styles.fieldWide}`}>
                      <span className={styles.label}>Official source URL</span>
                      <input
                        className={styles.control}
                        type="url"
                        required
                        value={year.sourceUrl}
                        onChange={(event) =>
                          updateYear("sourceUrl", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </section>
              </div>
            ) : null}
          </fieldset>
          <div className="sticky bottom-4 mt-7 flex items-center justify-between gap-4 rounded-2xl border border-[#d0d8c8] bg-[#f8faf4]/95 p-4 shadow-lg backdrop-blur">
            <p className={styles.muted}>
              Version {config.version}
              {dirty ? " · Unpublished changes" : " · Published"}
            </p>
            <button
              className={styles.button}
              type="submit"
              disabled={busy || !dirty}
            >
              {busy ? "Saving…" : "Publish settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
