"use client";

import { useEffect, useState, type FormEvent } from "react";
import { request } from "@/lib/menu-api";
import {
  ServiceRequestsTable,
  TablePagination,
  type ServiceRequest,
  statuses,
  displayStatus,
} from "./tools-module";

export function InquiriesAdminModule() {
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    setLoading(true);
    setItems([]);
    const params = new URLSearchParams({ page: String(page), source });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    void request<{ items: ServiceRequest[]; total: number }>(
      `/api/admin/tools/requests?${params.toString()}`,
      { cache: "no-store" },
    )
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Unable to load enquiries.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, reload, search, source, status]);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
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
      setError(err instanceof Error ? err.message : "Unable to update enquiry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c63c56]">
            Inbox
          </p>
          <h1 className="mt-2 font-brand text-[32px] font-semibold tracking-[-.03em] text-[#071b3d]">
            Enquiries & bookings
          </h1>
          <p className="mt-2 max-w-[620px] text-[13px] leading-6 text-[#687063]">
            Every contact form, calculator request and appointment enquiry in one
            private workspace.
          </p>
        </div>
        <a
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0055ff] transition-colors hover:underline"
          href="/"
          target="_blank"
          rel="noreferrer"
        >
          Open website ↗
        </a>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#d6dad0] bg-white/80 p-3.5 sm:p-4 backdrop-blur-sm shadow-[0_1px_3px_rgba(35,54,41,0.03)]">
        <div className="flex flex-wrap items-center gap-3">
          <form className="flex items-center gap-2" onSubmit={applySearch}>
            <div className="relative">
              <input
                type="text"
                className="min-h-10 w-[190px] sm:w-[240px] rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] pl-9 pr-3.5 text-[12.5px] font-medium text-[#1c191d] placeholder:text-[#9b958c] outline-none transition-all hover:border-[#c5bdb2] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                placeholder="Search people or messages…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                maxLength={120}
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
            <span>Source</span>
            <div className="relative">
              <select
                className="min-h-10 cursor-pointer appearance-none rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] pl-3.5 pr-8 text-[12.5px] font-semibold text-[#1c191d] outline-none transition-all hover:border-[#c5bdb2] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All enquiries</option>
                <option value="contact">Contact form</option>
                <option value="tools">Tools & calculators</option>
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
                <option value="">All statuses</option>
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
            {total} enquir{total === 1 ? "y" : "ies"}
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

      {error ? (
        <div
          className="mb-5 rounded-[14px] border border-[#f5c2c7] bg-[#f8d7da] p-4 text-[13px] text-[#842029]"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {/* Table content */}
      {loading ? (
        <div
          className="grid min-h-[260px] place-items-center rounded-[20px] border border-[#e2e7dd] bg-white text-[13px] font-semibold text-[#778175]"
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
            <span>Loading enquiries…</span>
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
          No enquiries match these filters.
        </div>
      ) : null}

      {/* Pagination controls */}
      <TablePagination
        page={page}
        pageSize={20}
        total={total}
        onPageChange={(newPage) => setPage(newPage)}
        itemName="enquiry"
      />
    </div>
  );
}
