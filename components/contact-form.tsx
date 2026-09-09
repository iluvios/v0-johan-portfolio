"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Loader2, Info, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { GlowButton } from "@/components/ui/glow-button";
import { usePortfolioCopy } from "@/lib/portfolio";

type Draft = { name: string; email: string; subject: string; message: string };
type FieldErrors = Partial<Record<keyof Draft, "required" | "invalidEmail">>;

export default function ContactForm() {
  const { copy } = usePortfolioCopy();
  const [draft, setDraft] = useState<Draft>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const sending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status !== "pending") setStatus("idle");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const invalid: FieldErrors = {};
    for (const field of ["name", "email", "message"] as const)
      if (!draft[field].trim()) invalid[field] = "required";
    if (
      draft.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
    )
      invalid.email = "invalidEmail";
    setErrors(invalid);
    const first = Object.keys(invalid)[0];
    if (first) {
      (
        formRef.current?.elements.namedItem(first) as HTMLInputElement | null
      )?.focus();
      return;
    }
    sending.current = true;
    setStatus("pending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(draft).map(([key, value]) => [key, value.trim()]),
          ),
        ),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }
  const mailto = `mailto:jdsub16@gmail.com?subject=${encodeURIComponent(draft.subject || "Portfolio inquiry")}&body=${encodeURIComponent(`${draft.message}\n\n${draft.name}\n${draft.email}`)}`;

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={submit}
      noValidate
      aria-busy={status === "pending"}
    >
      <FieldGroup>
        <FieldGroup className="sm:flex-row sm:gap-5">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="contact-name">{copy.name} *</FieldLabel>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              maxLength={120}
              value={draft.name}
              disabled={status === "pending"}
              onChange={(event) => update("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <FieldError id="name-error">{copy[errors.name]}</FieldError>
            )}
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="contact-email">{copy.email} *</FieldLabel>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={draft.email}
              disabled={status === "pending"}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <FieldError id="email-error">{copy[errors.email]}</FieldError>
            )}
          </Field>
        </FieldGroup>
        <Field>
          <FieldLabel htmlFor="contact-subject">
            {copy.subject}{" "}
            <span className="font-normal text-muted-foreground">
              ({copy.optional})
            </span>
          </FieldLabel>
          <Input
            id="contact-subject"
            name="subject"
            maxLength={200}
            value={draft.subject}
            disabled={status === "pending"}
            onChange={(event) => update("subject", event.target.value)}
          />
        </Field>
        <Field data-invalid={Boolean(errors.message)}>
          <FieldLabel htmlFor="contact-message">{copy.message} *</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            required
            maxLength={5000}
            rows={5}
            placeholder={copy.messageHint}
            value={draft.message}
            disabled={status === "pending"}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <FieldError id="message-error">{copy[errors.message]}</FieldError>
          )}
        </Field>
        <Field>
          <GlowButton type="submit" disabled={status === "pending"}>
            {status === "pending" ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                {copy.submitting}
              </>
            ) : (
              <>
                {copy.submit}
                <ArrowUpRight data-icon="inline-end" />
              </>
            )}
          </GlowButton>
          <FieldDescription>{copy.formNote}</FieldDescription>
        </Field>
        {status === "success" && (
          <Alert role="status">
            <Info className="size-4" />
            <AlertTitle>{copy.successTitle}</AlertTitle>
            <AlertDescription>
              {copy.successBody}
              <a className="text-link" href={mailto}>
                {copy.email}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </AlertDescription>
          </Alert>
        )}
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{copy.errorTitle}</AlertTitle>
            <AlertDescription>{copy.errorBody}</AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
}
