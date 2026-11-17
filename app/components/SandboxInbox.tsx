"use client";

import { Button, TextField } from "@trainvent/arcubic";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { LICENSE_API_URL } from "@/lib/config";

type Message = { id: string; received_at: number; to: string[]; subject: string; text: string; hasHtml: boolean; attachments: string[] };

export default function SandboxInbox({ text }: { text: Dictionary["sandbox"] }) {
  const [key, setKey] = useState("");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${LICENSE_API_URL}/sandbox/mail`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data) setMessages(data); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  async function load(login: boolean) {
    setBusy(true); setError(false);
    try {
      if (login) {
        const result = await fetch(`${LICENSE_API_URL}/sandbox/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: key }) });
        if (!result.ok) throw new Error("login");
        setKey("");
      }
      const result = await fetch(`${LICENSE_API_URL}/sandbox/mail`);
      if (!result.ok) throw new Error("inbox");
      setMessages(await result.json());
    } catch { setError(true); }
    finally { setBusy(false); }
  }
  return <>
    {messages === null ? <form className="license-form" onSubmit={event => { event.preventDefault(); void load(true); }}>
      <label htmlFor="sandbox-key">{text.key}</label>
      <div className="form-row"><TextField.Root id="sandbox-key" type="password" required autoComplete="off" value={key} onChange={event => setKey(event.target.value)} /><Button type="submit" loading={busy}>{text.open}</Button></div>
    </form> : <>
      <Button onClick={() => void load(false)} loading={busy}>{text.refresh}</Button>
      {messages.length === 0 && <p>{text.empty}</p>}
      {messages.map(message => <details className="sandbox-message" key={message.id}>
        <summary>{message.subject} <small>{new Date(message.received_at * 1000).toLocaleString()}</small></summary>
        <p>{text.sentTo}: {message.to.join(", ")}</p>
        {message.hasHtml ? <iframe title={text.preview} sandbox="" src={`${LICENSE_API_URL}/sandbox/mail/${message.id}/html`} /> : <pre>{message.text}</pre>}
        {message.attachments.length > 0 && <nav aria-label={text.attachments}>{message.attachments.map((name, index) => <a key={name} href={`${LICENSE_API_URL}/sandbox/mail/${message.id}/attachment/${index}`} target="_blank" rel="noreferrer">{name}</a>)}</nav>}
      </details>)}
    </>}
    {error && <p role="alert" className="form-message error">{text.error}</p>}
  </>;
}
