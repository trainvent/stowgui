"use client";

import { Button, TextField } from "@trainvent/arcubic";
import { useRef, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { LICENSE_API_URL } from "@/lib/config";

const FIELD_LIMITS = { name: 200, contract_reference: 500, email: 254 };
type Fields = keyof typeof FIELD_LIMITS;

export default function WithdrawalForm({ text, locale }: { text: Dictionary["withdrawal"]; locale: string }) {
  const [values, setValues] = useState({ name: "", contract_reference: "", email: "" });
  const [step, setStep] = useState<"edit" | "review" | "sent">("edit");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; received_at: number } | null>(null);
  const requestId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  if (!LICENSE_API_URL) return <p>{text.unavailable}</p>;

  function move(next: "edit" | "review" | "sent") {
    setStep(next);
    setError(false);
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit() {
    if (sending) return;
    setSending(true);
    setError(false);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch(`${LICENSE_API_URL}/withdrawal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": requestId.current },
        body: JSON.stringify({ ...values, locale }),
      });
      if (!response.ok) throw new Error("submission");
      setReceipt(await response.json());
      move("sent");
    } catch { setError(true); }
    finally { setSending(false); }
  }

  if (step === "sent" && receipt) return <section role="status">
    <h2 ref={heading} tabIndex={-1}>{text.received}</h2>
    <p>{text.sent}</p>
    <dl><dt>{text.receipt}</dt><dd>{receipt.id}</dd><dt>{text.receivedAt}</dt><dd>{new Date(receipt.received_at * 1000).toLocaleString(locale)}</dd></dl>
  </section>;

  if (step === "review") return <section>
    <h2 ref={heading} tabIndex={-1}>{text.review}</h2>
    <p>{text.declaration}</p>
    <dl className="withdrawal-details">{(Object.keys(values) as Fields[]).map((field) => <div key={field}><dt>{text[field]}</dt><dd>{values[field]}</dd></div>)}</dl>
    <div className="withdrawal-actions">
      <Button size="3" variant="soft" type="button" disabled={sending} onClick={() => { requestId.current = null; move("edit"); }}>{text.edit}</Button>
      <Button size="3" type="button" loading={sending} onClick={submit}>{text.confirm}</Button>
    </div>
    {error && <p role="alert" className="form-message error">{text.error}</p>}
  </section>;

  return <form className="withdrawal-form" onSubmit={(event) => { event.preventDefault(); move("review"); }}>
    <h2 ref={heading} tabIndex={-1}>{text.details}</h2>
    {(Object.keys(values) as Fields[]).map((field) => <div className="withdrawal-field" key={field}>
      <label htmlFor={`withdrawal-${field}`}>{text[field]}</label>
      <TextField.Root id={`withdrawal-${field}`} required size="3" type={field === "email" ? "email" : "text"}
        pattern={field === "email" ? undefined : ".*\\S.*"}
        aria-describedby={field === "contract_reference" ? "withdrawal-reference-help" : undefined}
        autoComplete={field === "contract_reference" ? "off" : field}
        maxLength={FIELD_LIMITS[field]} value={values[field]}
        onChange={(event) => setValues({ ...values, [field]: event.target.value })} />
      {field === "contract_reference" && <p id="withdrawal-reference-help" className="field-help">{text.referenceHelp}</p>}
    </div>)}
    <Button size="3" type="submit">{text.review}</Button>
  </form>;
}
