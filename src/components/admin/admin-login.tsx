"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAdminSession, loginAdmin } from "@/lib/menu-api";
import { useBranding } from "@/components/limex/branding-context";

export function AdminLogin() {
  const router = useRouter();
  const { logoUrl } = useBranding();
  const logoSrc = logoUrl || "/brand/limex-logo.png";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getAdminSession()
      .then(() => router.replace("/admin"))
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await loginAdmin(username, password);
      router.replace("/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071b3d] px-4 py-5 text-white sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute -left-24 top-[-120px] size-[340px] rounded-full bg-[#008cff]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-180px] right-[-100px] size-[430px] rounded-full bg-brand-cyan/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_430px] lg:gap-20">
        <section className="hidden max-w-[560px] lg:block">
          <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
            Secure workspace
          </span>
          <h1 className="mt-6 max-w-[520px] font-brand text-[56px] font-bold leading-[0.98] tracking-[-0.05em] text-white xl:text-[70px]">
            Make every menu change feel simple.
          </h1>
          <p className="mt-6 max-w-[460px] text-[17px] leading-[1.6] text-white/60">
            Shape the public Limex experience from one calm workspace. Update
            sections, service links and category icons without touching the
            front-end code.
          </p>
          <div className="mt-10 grid max-w-[470px] grid-cols-3 gap-3">
            {[
              ["04", "Main sections"],
              ["31+", "Menu services"],
              ["01", "Source of truth"],
            ].map(([value, label]) => (
              <div
                className="rounded-[18px] border border-white/10 bg-white/6 p-4"
                key={label}
              >
                <strong className="block text-[24px] tracking-[-0.04em] text-white">
                  {value}
                </strong>
                <span className="mt-1 block text-[11px] leading-[1.35] text-white/40">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[430px]">
          <div className="rounded-[28px] border border-white/10 bg-[#fcfbf9] p-5 text-[#071b3d] shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <img
                  className="h-auto w-[142px] object-contain object-left"
                  src={logoSrc}
                  alt="Limex Consultancy Firm"
                />
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0055ff]">
                  Admin sign in
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-[#e5fbff] text-[12px] font-bold text-[#007ea6]">
                A
              </span>
            </div>

            <h2 className="mt-8 font-brand text-[31px] font-bold leading-[1.05] tracking-[-0.04em]">
              Welcome back.
            </h2>
            <p className="mt-3 text-[14px] leading-[1.55] text-[#77736e]">
              Sign in to manage the services your customers see across Limex.
            </p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#4f4b47]">
                  Username
                </span>
                <input
                  className="min-h-12 w-full rounded-[14px] border border-[#ddd7ce] bg-white px-4 text-[15px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#4f4b47]">
                  Password
                </span>
                <input
                  className="min-h-12 w-full rounded-[14px] border border-[#ddd7ce] bg-white px-4 text-[15px] text-[#071b3d] outline-none transition-colors placeholder:text-[#aaa49b] focus:border-[#0055ff] focus:ring-4 focus:ring-[#008cff]/10"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {error ? (
                <p
                  className="rounded-[12px] bg-[#fce0e3] px-3.5 py-3 text-[13px] leading-[1.4] text-[#ad3148]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <button
                className="flex min-h-12 w-full items-center justify-between rounded-full bg-[#071b3d] px-5 text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                <span>
                  {submitting ? "Signing in…" : "Continue to workspace"}
                </span>
                <span className="text-[18px] text-[#008cff]" aria-hidden="true">
                  ↗
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-[1.45] text-[#aaa49b]">
              Access is controlled by the admin credentials configured in your
              environment.
            </p>
          </div>
          <a
            className="mx-auto mt-5 block w-max text-[12px] font-semibold text-white/45 transition-colors hover:text-white"
            href="/"
          >
            ← Back to Limex website
          </a>
        </section>
      </div>
    </main>
  );
}
