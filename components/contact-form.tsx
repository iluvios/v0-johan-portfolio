"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Info } from "lucide-react";
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
import { CONTACT_EMAIL } from "@/lib/site";

type Draft = { name: string; email: string; subject: string; message: string };
type FieldErrors = Partial<Record<keyof Draft, "required" | "invalidEmail">>;

// There is no mail backend: the form composes the message in the visitor's
// email app so it reaches the inbox directly instead of being silently dropped.
export default function ContactForm() {
  const { copy } = usePortfolioCopy();
  const [draft, setDraft] = useState<Draft>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [opened, setOpened] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  function update(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(draft.subject.trim() || "Portfolio inquiry")}&body=${encodeURIComponent(`${draft.message.trim()}\n\n${draft.name.trim()}\n${draft.email.trim()}`)}`;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    window.location.href = mailto;
    setOpened(true);
  }

  return (
    <form ref={formRef} className="contact-form" onSubmit={submit} noValidate>
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
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <FieldError id="message-error">{copy[errors.message]}</FieldError>
          )}
        </Field>
        <Field>
          <GlowButton type="submit">
            {copy.submit}
            <ArrowUpRight data-icon="inline-end" />
          </GlowButton>
          <FieldDescription>{copy.formNote}</FieldDescription>
        </Field>
        {opened && (
          <Alert role="status">
            <Info className="size-4" />
            <AlertTitle>{copy.openedTitle}</AlertTitle>
            <AlertDescription>
              {copy.openedBody}{" "}
              <a className="text-link" href={mailto}>
                {CONTACT_EMAIL}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
}
