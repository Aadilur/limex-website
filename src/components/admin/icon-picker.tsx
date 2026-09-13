"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ServiceIcon,
  serviceIconOptions,
} from "@/components/limex/service-icons";
import type { ServiceIconName } from "@/components/limex/data";

const validIconNames = new Set<ServiceIconName>(
  serviceIconOptions.map((option) => option.value),
);

export function normalizeServiceIcon(
  value: string | null | undefined,
): ServiceIconName {
  return value && validIconNames.has(value as ServiceIconName)
    ? (value as ServiceIconName)
    : "briefcase";
}

type IconPickerProps = {
  value: string;
  onChange: (value: ServiceIconName) => void;
  disabled?: boolean;
};

export function IconPicker({
  value,
  onChange,
  disabled = false,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedValue = normalizeServiceIcon(value);
  const selectedOption =
    serviceIconOptions.find((option) => option.value === selectedValue) ??
    serviceIconOptions[0];
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return serviceIconOptions;

    return serviceIconOptions.filter((option) =>
      `${option.label} ${option.value}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function chooseIcon(icon: ServiceIconName) {
    onChange(icon);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        className="flex min-h-11 w-full items-center gap-2.5 rounded-[12px] border border-[#dcd5cb] bg-[#fffefa] px-3 text-left text-[12.5px] font-semibold text-[#1c191d] shadow-[0_1px_2px_rgba(30,25,20,0.02)] transition-all hover:border-[#c5bdb2] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#008cff]/15 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#f0f4ff] text-[#0055ff] border border-[#0055ff]/10">
          <ServiceIcon name={selectedValue} className="size-[17px]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <svg
          className={`size-4 text-[#8b857e] transition-transform duration-200 ${open ? "rotate-180 text-[#0055ff]" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(320px,calc(100vw-48px))] rounded-[18px] border border-[#e2dcd4] bg-white p-3 shadow-[0_18px_45px_rgba(20,19,28,0.14),0_2px_8px_rgba(0,0,0,0.04)]"
          role="listbox"
          aria-label="Choose service icon"
        >
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9c958c]"
              aria-hidden="true"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              className="min-h-10 w-full rounded-[11px] border border-[#e4dfd7] bg-[#fbfaf7] pl-8.5 pr-3 text-[12px] text-[#071b3d] outline-none placeholder:text-[#a09a92] transition-all focus:border-[#0055ff] focus:bg-white focus:ring-2 focus:ring-[#008cff]/10"
              type="search"
              placeholder="Search icons…"
              aria-label="Search icons"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </div>
          <div
            className="mt-2.5 grid max-h-[230px] grid-cols-4 gap-1.5 overflow-y-auto pr-0.5"
            role="group"
          >
            {filteredOptions.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <button
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-[11px] px-1 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055ff] ${
                    selected
                      ? "bg-[#0055ff] text-white shadow-sm font-semibold"
                      : "text-[#5e5850] hover:bg-[#f6f2ed] hover:text-[#071b3d]"
                  }`.trim()}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={option.label}
                  key={option.value}
                  onClick={() => chooseIcon(option.value)}
                >
                  <ServiceIcon name={option.value} className="size-[20px]" />
                  <span className="w-full truncate text-[9.5px] leading-tight">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
          {!filteredOptions.length ? (
            <p className="px-2 py-4 text-center text-[11.5px] text-[#8b857e]">
              No icons match that search.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
