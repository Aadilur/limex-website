"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  isTemplateFieldManagedByRepeater,
  isTemplateFieldVisible,
  missingTemplateFields,
  scaledTemplateFontSizeMetrics,
  templateFontScaleDefault,
  templateFontScaleMax,
  templateFontScaleMin,
  templateFontSizeMetrics,
  templatePaperSizeLabels,
  templateRepeaterFieldValueKey,
  templateRepeaterItemContext,
  templateRepeaterItemIndexes,
  type PublicDocumentTemplate,
  type TemplateField,
  type TemplateRepeater,
  type TemplateRepeaterField,
  type TemplateValues,
} from "@/lib/document-templates";
import {
  getAdminTemplatePreview,
  getPublishedTemplate,
} from "@/lib/template-api";
import { renderTemplateDocx } from "@/lib/document-template-docx";
import { renderTemplatePrintHtml } from "@/lib/document-template-print";
import { DocumentTemplatePaper } from "./document-template-paper";
import { Breadcrumbs } from "./ui";

const inputClass =
  "h-11 w-full rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 text-[13px] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";
const areaClass =
  "min-h-28 w-full resize-y rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 py-3 text-[13px] leading-[1.5] text-[#242129] outline-none transition-colors placeholder:text-[#a19a91] focus:border-[#0055ff] focus:ring-4 focus:ring-[#f8d9de]";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField | TemplateRepeaterField;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = (
    <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#6f6961]">
      {field.label}
      {field.required ? <span className="ml-1 text-[#0055ff]">*</span> : null}
    </span>
  );
  if (field.type === "textarea")
    return (
      <label className="block">
        {label}
        <textarea
          className={areaClass}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  if (field.type === "select")
    return (
      <label className="block">
        {label}
        <select
          className={`${inputClass} cursor-pointer`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{field.placeholder || "Choose an option"}</option>
          {field.options.map((option, index) => (
            <option value={option.value} key={`${option.value}-${index}`}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  if (field.type === "checkbox")
    return (
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[12px] border border-[#d9d3c9] bg-[#fcfbf8] px-3.5 text-[14px] font-semibold text-[#403b36]">
        <input
          className="size-4 accent-[#0055ff]"
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(String(event.target.checked))}
        />
        {field.label}
        {field.required ? <span className="text-[#0055ff]">*</span> : null}
      </label>
    );
  return (
    <label className="block">
      {label}
      <input
        className={inputClass}
        type={field.type === "number" ? "number" : field.type}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function RepeaterInputGroup({
  repeater,
  values,
  onChange,
}: {
  repeater: TemplateRepeater;
  values: TemplateValues;
  onChange: (key: string, value: string) => void;
}) {
  const indexes = templateRepeaterItemIndexes(repeater, values);
  return (
    <fieldset className="rounded-[14px] bg-[#f7f4ef] p-3.5 sm:p-4">
      <legend className="px-1 text-[13px] font-bold text-[#2d2824]">
        {repeater.label}
      </legend>
      {repeater.description ? (
        <p className="mt-0.5 text-[11px] leading-[1.45] text-[#817970]">
          {repeater.description}
        </p>
      ) : null}
      <div className="mt-3 grid gap-3">
        {indexes.map((index) => {
          const itemValues = templateRepeaterItemContext(
            repeater,
            index,
            values,
          );
          return (
            <div
              className="rounded-[12px] bg-white/75 p-3"
              key={`${repeater.id}-${index}`}
            >
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f6961]">
                  {repeater.itemLabel} {index}
                </p>
                <span className="text-[10px] text-[#a19a91]">
                  {index} / {repeater.maxItems}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {repeater.fields
                  .filter((field) => isTemplateFieldVisible(field, itemValues))
                  .map((field) => {
                    const valueKey = templateRepeaterFieldValueKey(
                      repeater,
                      index,
                      field,
                    );
                    return (
                      <FieldInput
                        field={field}
                        value={
                          values[valueKey] ??
                          field.defaultValue ??
                          (field.type === "checkbox" ? "false" : "")
                        }
                        onChange={(value) => onChange(valueKey, value)}
                        key={`${repeater.id}-${index}-${field.id}`}
                      />
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function TemplateWorkspace({
  slug,
  preview = false,
}: {
  slug: string;
  preview?: boolean;
}) {
  const [template, setTemplate] = useState<PublicDocumentTemplate | null>(null);
  const [userFontScale, setUserFontScale] = useState<number | null>(null);
  const [values, setValues] = useState<TemplateValues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [printing, setPrinting] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let active = true;
    const load = preview
      ? getAdminTemplatePreview(slug).then((loaded) => ({
          slug: loaded.slug,
          title: loaded.title,
          description: loaded.description,
          settings: loaded.settings,
          fields: loaded.fields,
          pages: loaded.pages,
          publishedAt: loaded.updatedAt,
        }))
      : getPublishedTemplate(slug);
    void load
      .then((loaded) => {
        if (!active) return;
        setTemplate(loaded);
        const initialValues = Object.fromEntries(
          loaded.fields.map((field) => [
            field.key,
            field.type === "checkbox" ? "false" : (field.defaultValue ?? ""),
          ]),
        );
        for (const repeater of loaded.settings.repeaters)
          for (let index = 1; index <= repeater.maxItems; index += 1)
            for (const field of repeater.fields) {
              const valueKey = templateRepeaterFieldValueKey(
                repeater,
                index,
                field,
              );
              if (initialValues[valueKey] === undefined)
                initialValues[valueKey] =
                  field.type === "checkbox"
                    ? "false"
                    : (field.defaultValue ?? "");
            }
        setValues(initialValues);
      })
      .catch((value) => {
        if (active)
          setError(
            value instanceof Error
              ? value.message
              : "This template is not available.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [preview, slug]);

  const defaultFontScale =
    template?.settings.fontScale ?? templateFontScaleDefault;
  const currentFontScale = userFontScale ?? defaultFontScale;

  const effectiveTemplate = useMemo(() => {
    if (!template) return null;
    if (userFontScale === null || userFontScale === template.settings.fontScale)
      return template;
    return {
      ...template,
      settings: {
        ...template.settings,
        fontScale: userFontScale,
      },
    };
  }, [template, userFontScale]);

  const missing = useMemo(
    () =>
      effectiveTemplate
        ? missingTemplateFields(
            effectiveTemplate.fields,
            values,
            effectiveTemplate.settings.repeaters,
          )
        : [],
    [effectiveTemplate, values],
  );
  const visibleFields = useMemo(
    () =>
      effectiveTemplate
        ? effectiveTemplate.fields.filter(
            (field) =>
              !isTemplateFieldManagedByRepeater(
                field,
                effectiveTemplate.settings.repeaters,
              ) && isTemplateFieldVisible(field, values),
          )
        : [],
    [effectiveTemplate, values],
  );
  const serviceCta = effectiveTemplate?.settings.serviceCta;

  function update(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function print() {
    if (!effectiveTemplate || printing || exportingDocx) return;
    if (missing.length) {
      setError(`Complete: ${missing.map((field) => field.label).join(", ")}.`);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const html = renderTemplatePrintHtml(effectiveTemplate, values);
    setPrinting(true);
    setError("");

    const printInFrame = () => {
      const frame = document.createElement("iframe");
      frame.title = "Printable document preview";
      frame.setAttribute("aria-hidden", "true");
      frame.style.position = "fixed";
      frame.style.right = "0";
      frame.style.bottom = "0";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.style.border = "0";
      frame.style.visibility = "hidden";
      document.body.appendChild(frame);
      const frameWindow = frame.contentWindow;
      if (!frameWindow) {
        frame.remove();
        setPrinting(false);
        setError("The print preview could not be opened. Please try again.");
        return;
      }
      const cleanup = () => window.setTimeout(() => frame.remove(), 1000);
      frameWindow.document.open();
      frameWindow.document.write(html);
      frameWindow.document.close();
      frameWindow.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(() => {
        if (!frame.isConnected) return;
        frameWindow.focus();
        frameWindow.print();
        setPrinting(false);
        cleanup();
      }, 450);
    };

    const popup = window.open("", "_blank", "width=900,height=900");
    if (!popup) {
      printInFrame();
      return;
    }
    try {
      popup.opener = null;
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      window.setTimeout(() => {
        if (popup.closed) {
          setPrinting(false);
          return;
        }
        try {
          popup.focus();
          popup.print();
        } catch {
          setError("The print preview could not be opened. Please try again.");
          if (!popup.closed) popup.close();
        } finally {
          setPrinting(false);
        }
      }, 450);
    } catch {
      setPrinting(false);
      setError("The print preview could not be opened. Please try again.");
      if (!popup.closed) popup.close();
    }
  }

  async function downloadDocx() {
    if (!effectiveTemplate || printing || exportingDocx) return;
    if (missing.length) {
      setError(`Complete: ${missing.map((field) => field.label).join(", ")}.`);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setExportingDocx(true);
    setError("");
    try {
      const blob = await renderTemplateDocx(effectiveTemplate, values);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${effectiveTemplate.slug}.docx`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (value) {
      console.error("DOCX export failed", value);
      setError(
        "The editable Word document could not be generated. Please try again.",
      );
    } finally {
      setExportingDocx(false);
    }
  }

  if (loading)
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[24px] border border-[#e1dcd4] bg-white text-[13px] font-semibold text-[#777168]">
        Loading template…
      </div>
    );
  if (!effectiveTemplate)
    return (
      <div className="rounded-[24px] border border-[#f0c7ce] bg-[#fff8f8] p-6 text-[13px] font-semibold text-[#c53e59]">
        {error || "This template is not available."}
      </div>
    );

  return (
    <div className="min-w-0 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Business tools", href: "/business-tools" },
          { label: effectiveTemplate.title },
        ]}
      />
      <header className="max-w-[760px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0055ff]">
          {preview ? "Draft preview" : "Business document template"}
        </p>
        <h1 className="mt-2 font-brand text-[32px] font-bold leading-[1.05] tracking-[-0.045em] text-[#071b3d] sm:text-[46px]">
          {effectiveTemplate.title}
        </h1>
        <p className="mt-3 text-[14px] leading-[1.7] text-[#756e66]">
          {effectiveTemplate.description} Fill in the fields, review the
          document, then print, save as PDF, or download an editable Word file.
        </p>
      </header>
      {serviceCta?.enabled && serviceCta.href ? (
        <section
          className="flex flex-col gap-4 rounded-[18px] bg-[#eaf3ff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          aria-label="Related service"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#006dce]">
              Related service
            </p>
            <h2 className="mt-1 font-brand text-[18px] font-bold tracking-[-0.02em] text-[#071b3d]">
              {serviceCta.title}
            </h2>
            <p className="mt-1 max-w-[680px] text-[12px] leading-[1.5] text-[#536b84]">
              {serviceCta.description}
            </p>
          </div>
          <Link
            href={serviceCta.href}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-[#0055ff] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#0039b8]"
          >
            {serviceCta.linkLabel}
            <span className="ml-2" aria-hidden="true">
              ↗
            </span>
          </Link>
        </section>
      ) : null}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.84fr)_minmax(420px,1.16fr)]">
        <form
          className="min-w-0 rounded-[22px] border border-[#e1dcd4] bg-white p-4 sm:p-6"
          ref={formRef}
          onSubmit={(event) => {
            event.preventDefault();
            print();
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#ebe5dd] pb-4">
            <div>
              <h2 className="font-brand text-[22px] font-bold tracking-[-0.03em] text-[#071b3d]">
                Your details
              </h2>
              <p className="mt-1 text-[12px] text-[#817970]">
                Fields marked with * are required.
              </p>
            </div>
            <span className="rounded-full bg-[#f4eee8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#796d61]">
              {templatePaperSizeLabels[effectiveTemplate.settings.paperSize]}
            </span>
          </div>
          <div className="mt-5 grid gap-4">
            {visibleFields.map((field) => (
              <FieldInput
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => update(field.key, value)}
                key={field.id}
              />
            ))}
            {effectiveTemplate.settings.repeaters.map((repeater) => (
              <RepeaterInputGroup
                repeater={repeater}
                values={values}
                onChange={update}
                key={repeater.id}
              />
            ))}
          </div>
          {visibleFields.length === 0 &&
          effectiveTemplate.settings.repeaters.length === 0 ? (
            <p className="mt-5 rounded-[12px] bg-[#f7f4ef] px-3.5 py-3 text-[12px] font-semibold text-[#756e66]">
              Choose the document options above to continue.
            </p>
          ) : null}
          {error ? (
            <p
              className="mt-5 rounded-[12px] border border-[#f0c7ce] bg-[#fff8f8] px-3.5 py-3 text-[12px] font-semibold text-[#c53e59]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-6 border-t border-[#ebe5dd] pt-5">
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#071b3d] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#0055ff] disabled:cursor-wait disabled:opacity-70"
                type="submit"
                disabled={printing || exportingDocx}
              >
                {printing ? "Opening print preview…" : "Print / Save as PDF"}{" "}
                <span aria-hidden="true">{printing ? "…" : "↗"}</span>
              </button>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#d9d3c9] bg-[#fcfbf8] px-5 text-[13px] font-bold text-[#242129] transition-colors hover:border-[#0055ff] hover:bg-[#fff5f6] disabled:cursor-wait disabled:opacity-70"
                type="button"
                onClick={() => void downloadDocx()}
                disabled={printing || exportingDocx}
              >
                {exportingDocx
                  ? "Preparing Word file…"
                  : "Download editable DOCX"}{" "}
                <span aria-hidden="true">{exportingDocx ? "…" : "↓"}</span>
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-[1.45] text-[#938a80]">
              This is a draft for review. Check applicable legal, stamp and
              signing requirements before use.
            </p>
          </div>
        </form>
        <section
          className="flex h-[min(680px,calc(100vh-96px))] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e1dcd4] bg-[#f7f4ef] p-3 sm:p-5 xl:sticky xl:top-[104px] xl:h-[calc(100vh-128px)]"
          aria-label="Document preview"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0055ff]">
                Live preview
              </p>
              <p className="mt-1 text-[12px] text-[#817970]">
                {templatePaperSizeLabels[effectiveTemplate.settings.paperSize]}{" "}
                ratio · {effectiveTemplate.pages.length}{" "}
                {effectiveTemplate.pages.length === 1 ? "page" : "pages"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[#d8d2c8] bg-white px-2.5 py-1 shadow-sm">
                <span className="text-[11px] font-bold text-[#6f6961]">
                  Font scale:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setUserFontScale(
                      Math.max(templateFontScaleMin, currentFontScale - 10),
                    )
                  }
                  disabled={currentFontScale <= templateFontScaleMin}
                  aria-label="Decrease font size"
                  className="grid size-6 place-items-center rounded-full bg-[#f4eee8] text-[13px] font-bold text-[#514c47] transition-colors hover:bg-[#e9e1d8] disabled:opacity-40"
                >
                  −
                </button>
                <span
                  className="min-w-[42px] text-center text-[11px] font-bold text-[#071b3d]"
                  title={`Effective body: ${scaledTemplateFontSizeMetrics(effectiveTemplate.settings.defaultFontSize, currentFontScale).sizePx}px / ${(scaledTemplateFontSizeMetrics(effectiveTemplate.settings.defaultFontSize, currentFontScale).sizePx * 0.75).toFixed(1)}pt`}
                >
                  {currentFontScale}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setUserFontScale(
                      Math.min(templateFontScaleMax, currentFontScale + 10),
                    )
                  }
                  disabled={currentFontScale >= templateFontScaleMax}
                  aria-label="Increase font size"
                  className="grid size-6 place-items-center rounded-full bg-[#f4eee8] text-[13px] font-bold text-[#514c47] transition-colors hover:bg-[#e9e1d8] disabled:opacity-40"
                >
                  +
                </button>
                {currentFontScale !== defaultFontScale ? (
                  <button
                    type="button"
                    onClick={() => setUserFontScale(null)}
                    className="ml-1 rounded-full bg-[#eef3fe] px-2 py-0.5 text-[10px] font-bold text-[#0055ff] transition-colors hover:bg-[#dfeafc]"
                    title={`Reset to template default (${defaultFontScale}%)`}
                  >
                    Reset ({defaultFontScale}%)
                  </button>
                ) : (
                  <span className="text-[10px] text-[#958c82]">
                    (Default:{" "}
                    {templateFontSizeMetrics[
                      effectiveTemplate.settings.defaultFontSize
                    ]?.sizePx ?? 14}
                    px)
                  </span>
                )}
              </div>
              <span className="hidden text-[12px] font-semibold text-[#817970] sm:inline">
                Empty fields show labels
              </span>
            </div>
          </div>
          <div
            className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain rounded-[15px] bg-[#eee9e2] p-2 sm:p-3"
            tabIndex={0}
            role="region"
            aria-label="Scrollable live document pages"
          >
            <div className="mx-auto w-full max-w-[820px] min-w-0">
              <DocumentTemplatePaper
                template={effectiveTemplate}
                values={values}
                showLabels
                compact
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
