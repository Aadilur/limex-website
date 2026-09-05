import type { ToolField, ToolValues } from "@/lib/business-tools";
import styles from "./tools.module.css";

export function ToolFields({ fields, values, onChange, prefix, disabled = false }: { fields: ToolField[]; values: ToolValues; onChange: (key: string, value: string) => void; prefix: string; disabled?: boolean }) {
  return <div className={styles.fields}>{fields.filter((field) => !field.showWhen || ("value" in field.showWhen ? values[field.showWhen.key] === field.showWhen.value : field.showWhen.values.includes(values[field.showWhen.key]))).map((field) => {
    const id = `${prefix}-${field.key}`;
    const common = { id, disabled, className: styles.control, required: field.required, value: values[field.key] ?? "", "aria-describedby": field.hint ? `${id}-hint` : undefined, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(field.key, event.target.value) };
    return <div className={`${styles.field} ${field.kind === "textarea" ? styles.fieldWide : ""}`} key={field.key}>
      <label htmlFor={id} className={styles.label}>{field.label}</label>
      {field.kind === "select" ? <select {...common}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.kind === "textarea" ? <textarea {...common} maxLength={5000} rows={3} /> : <input {...common} type={field.kind === "number" || field.kind === "date" ? field.kind : "text"} inputMode={field.kind === "number" ? "decimal" : undefined} min={field.kind === "number" ? field.min ?? 0 : undefined} max={field.kind === "number" ? field.max ?? 1e12 : undefined} step={field.kind === "number" ? field.step ?? "any" : undefined} maxLength={5000} placeholder={field.kind === "number" ? "0" : undefined} />}
      {field.hint ? <span className={styles.hint} id={`${id}-hint`}>{field.hint}</span> : null}
    </div>;
  })}</div>;
}
