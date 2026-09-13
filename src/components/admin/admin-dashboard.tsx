"use client";

import { useEffect, useMemo, useState } from "react";

import { getAdminMenu, isUnauthorizedError, type AdminMenuSection } from "@/lib/menu-api";

function StatCard({ value, label, detail, accent }: { value: string; label: string; detail: string; accent: string }) {
  return (
    <article className="rounded-[22px] border border-[#e1dcd4] bg-white p-5 sm:p-6">
      <span className={`grid size-10 place-items-center rounded-[13px] text-[14px] font-bold ${accent}`.trim()} aria-hidden="true">↗</span>
      <strong className="mt-6 block font-brand text-[34px] font-bold leading-none tracking-[-0.05em] text-[#071b3d]">{value}</strong>
      <p className="mt-2 text-[14px] font-semibold text-[#3f3c38]">{label}</p>
      <p className="mt-1 text-[12px] leading-[1.45] text-[#8b857e]">{detail}</p>
    </article>
  );
}

export function AdminDashboard() {
  const [sections, setSections] = useState<AdminMenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getAdminMenu()
      .then(setSections)
      .catch((loadError: unknown) => {
        if (isUnauthorizedError(loadError)) {
          window.location.assign("/admin/login");
          return;
        }
        setError("Menu data unavailable. Run the migration and seed, then refresh.");
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const groups = sections.flatMap((section) => section.groups);
    const items = groups.flatMap((group) => group.items);
    const links = items.flatMap((item) => item.links);

    return {
      sections: sections.length,
      groups: groups.length,
      items: items.length,
      links: links.length,
    };
  }, [sections]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[24px] bg-[#071b3d] p-5 text-white sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#14dcff]">Admin</p>
            <h1 className="mt-2 font-brand text-[34px] font-bold leading-none tracking-[-0.05em] sm:text-[44px]">Content control center</h1>
            <p className="mt-2 text-[13px] text-white/50">Manage the public Limex experience from one place.</p>
          </div>
          <a className="inline-flex min-h-11 w-max items-center justify-between gap-5 rounded-full bg-white px-4 text-[12px] font-bold text-[#071b3d] transition-transform hover:-translate-y-0.5" href="/admin/landing">
            Manage landing <span className="text-[17px] text-[#0055ff]" aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="workspace-stats-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">Overview</p>
            <h2 className="mt-2 font-brand text-[25px] font-bold tracking-[-0.04em] text-[#071b3d]" id="workspace-stats-title">Menu at a glance</h2>
          </div>
          <span className="hidden text-[12px] text-[#8b857e] sm:block">{loading ? "Syncing…" : "Synced with public navigation"}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard value={loading ? "—" : String(stats.sections)} label="Sections" detail="Primary nav" accent="bg-[#fce0e3] text-[#0055ff]" />
          <StatCard value={loading ? "—" : String(stats.groups)} label="Categories" detail="Menu groups" accent="bg-[#e5fbff] text-[#007ea6]" />
          <StatCard value={loading ? "—" : String(stats.items)} label="Services" detail="Public entries" accent="bg-[#e8f3ff] text-[#006dce]" />
          <StatCard value={loading ? "—" : String(stats.links)} label="Sub-links" detail="Nested links" accent="bg-[#e9efff] text-[#0055ff]" />
        </div>
      </section>

      {error ? <p className="rounded-[14px] border border-[#f1c6ce] bg-[#fff8f8] px-4 py-3 text-[13px] text-[#ad3148]" role="alert">{error}</p> : null}

      <section className="rounded-[22px] border border-[#e1dcd4] bg-white p-5 sm:p-6" aria-labelledby="quick-actions-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0055ff]">Quick actions</p>
            <h2 className="mt-1.5 font-brand text-[22px] font-bold tracking-[-0.04em] text-[#071b3d]" id="quick-actions-title">Keep the experience current.</h2>
          </div>
          <span className="grid size-10 place-items-center rounded-[12px] bg-[#f3f1ec] text-[16px] text-[#0055ff]" aria-hidden="true">✦</span>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <a className="flex min-h-12 items-center justify-between rounded-[14px] bg-[#fff0f2] px-4 text-[13px] font-bold text-[#ad3148] transition-colors hover:bg-[#fce0e3]" href="/admin/landing">Manage landing <span aria-hidden="true">↗</span></a>
          <a className="flex min-h-12 items-center justify-between rounded-[14px] bg-[#f8f6f2] px-4 text-[13px] font-bold text-[#3f3c38] transition-colors hover:bg-[#f1ede6]" href="/admin/services">Edit sections and services <span className="text-[#0055ff]" aria-hidden="true">↗</span></a>
          <a className="flex min-h-12 items-center justify-between rounded-[14px] bg-[#e8f3ff] px-4 text-[13px] font-bold text-[#006dce] transition-colors hover:bg-[#dff0ff]" href="/" target="_blank" rel="noreferrer">Preview public menu <span aria-hidden="true">↗</span></a>
          <a className="flex min-h-12 items-center justify-between rounded-[14px] bg-[#e9efff] px-4 text-[13px] font-bold text-[#0055ff] transition-colors hover:bg-[#dfe8ff]" href="/admin/about">Manage About us <span aria-hidden="true">↗</span></a>
          <a className="flex min-h-12 items-center justify-between rounded-[14px] bg-[#e5fbff] px-4 text-[13px] font-bold text-[#007ea6] transition-colors hover:bg-[#d8f7ff]" href="/admin/contact">Contact settings <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </div>
  );
}
