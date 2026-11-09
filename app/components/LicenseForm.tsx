"use client";

import { Button, TextField } from "@trainvent/arcubic";
import { useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { LICENSE_API_URL } from "@/lib/config";

type Status = "idle" | "sending" | "sent" | "error";

export default function LicenseForm({ text, locale }: { text: Dictionary["license"]; locale: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (!LICENSE_API_URL) {
    return <p>{text.unavailable}</p>;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch(`${LICENSE_API_URL}/license/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      setStatus(response.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="form-message success">{text.sent}</p>;
  }

  return (
    <form className="license-form" onSubmit={submit}>
      <label htmlFor="license-email">{text.email}</label>
      <div className="form-row">
        <TextField.Root
          id="license-email"
          type="email"
          required
          autoComplete="email"
          size="3"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button size="3" type="submit" loading={status === "sending"}>
          {text.submit}
        </Button>
      </div>
      {status === "error" && <p className="form-message error">{text.error}</p>}
    </form>
  );
}
