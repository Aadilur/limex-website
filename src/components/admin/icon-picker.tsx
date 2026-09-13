"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ServiceIcon, serviceIconOptions } from "@/components/limex/service-icons";
import type { ServiceIconName } from "@/components/limex/data";

const validIconNames = new Set<ServiceIconName>(serviceIconOptions.map((option) => option.value));

export function normalizeServiceIcon(value: string | null | undefined): ServiceIconName {
  return value && validIconNames.has(value as ServiceIconName) ? value as ServiceIconName : "briefcase";
}

type IconPickerProps = {
  value: string;
  onChange: (value: ServiceIconName) => void;
  disabled?: boolean;
};

export function IconPicker({ value, onChange, disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedValue = normalizeServiceIcon(value);
  const selectedOption = serviceIconOptions.find((option) => option.value === selectedValue) ?? serviceIconOptions[0];
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return serviceIconOptions;

    return serviceIconOptions.filter((option) => `${option.label} ${option.value}`.toLowerCase().includes(normalizedQuery));
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setOpen(false);
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
        className="flex min-h-11 w-full items-center gap-2.5 rounded-[12px] border border-[#ddd7ce] bg-white px-3 text-left text-[12px] font-semibold text-[#3f3c38] transition-colors hover:border-[#bbb3a8] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#008cff]/25 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-[#f3f1ec] text-[#0055ff]">
          <ServiceIcon name={selectedValue} className="size-[17px]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{selectedOption.label}</span>
        <span className={`text-[14px] text-[#948d84] transition-transform ${open ? "rotate-180" : ""}`.trim()} aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(300px,calc(100vw-48px))] rounded-[16px] border border-[#ddd7ce] bg-white p-2.5 shadow-[0_18px_45px_rgba(20,19,28,0.16)]" role="listbox" aria-label="Choose service icon">
          <input
            className="min-h-10 w-full rounded-[10px] border border-[#e4dfd7] bg-[#f8f6f2] px-3 text-[12px] text-[#071b3d] outline-none placeholder:text-[#a09a92] focus:border-[#0055ff]"
            type="search"
            placeholder="Search icons"
            aria-label="Search icons"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="mt-2 grid max-h-[230px] grid-cols-4 gap-1.5 overflow-y-auto pr-0.5" role="group">
            {filteredOptions.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <button
                  className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-center transition-colors focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-[#008cff] ${selected ? "bg-[#e8efff] text-[#0055ff]" : "text-[#716c67] hover:bg-[#f6f2ed] hover:text-[#071b3d]"}`.trim()}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={option.label}
                  key={option.value}
                  onClick={() => chooseIcon(option.value)}
                >
                  <ServiceIcon name={option.value} className="size-[20px]" />
                  <span className="w-full truncate text-[9px] font-semibold leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
          {!filteredOptions.length ? <p className="px-2 py-4 text-center text-[11px] text-[#8b857e]">No icons match that search.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
