"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { type CaseStudy, emptyCaseStudy } from "@/lib/projects"

const field = "bg-slate-900/80 border-slate-700 text-white mt-1"
const addButton = "border-slate-700 hover:border-blue-400 text-slate-300"

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-700/70 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-100">{title}</legend>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </fieldset>
  )
}

export function CaseStudyEditor({
  value,
  onChange,
}: {
  value: CaseStudy | null
  onChange: (next: CaseStudy) => void
}) {
  const cs = value ?? emptyCaseStudy()
  const set = <K extends keyof CaseStudy>(key: K, next: CaseStudy[K]) => onChange({ ...cs, [key]: next })
  const updateMetric = (index: number, patch: Partial<CaseStudy["metrics"][number]>) =>
    set(
      "metrics",
      cs.metrics.map((metric, i) => (i === index ? { ...metric, ...patch } : metric)),
    )

  return (
    <div className="space-y-5 border-t border-slate-700 pt-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Case study</h3>
        <p className="mt-1 text-xs text-slate-400">
          Optional. Each section only shows on the site once it has content. Screenshots that back up the
          results go in the gallery above.
        </p>
      </div>

      <Section title="Context">
        <div>
          <Label className="text-slate-200">What I did (tags on the card)</Label>
          <Input
            value={cs.work.join(", ")}
            onChange={(e) => set("work", e.target.value.split(",").map((w) => w.trimStart()))}
            placeholder="Meta & Google Ads, Web development, Email, SEO"
            className={field}
          />
          <p className="mt-1 text-xs text-slate-400">Comma separated. The card shows the first four.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
          <div>
            <Label className="text-slate-200">When</Label>
            <Input value={cs.year} onChange={(e) => set("year", e.target.value)} placeholder="Dec 2024 – Apr 2025" className={field} />
          </div>
          <div>
            <Label className="text-slate-200">My role</Label>
            <Input
              value={cs.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Paid media, Shopify development, CRO"
              className={field}
            />
          </div>
        </div>
      </Section>

      <Section title="Results">
        {cs.metrics.map((metric, i) => (
          <div key={i} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[140px_1fr_auto]">
            <Input value={metric.value} onChange={(e) => updateMetric(i, { value: e.target.value })} placeholder="+132%" className={field} />
            <Input value={metric.label} onChange={(e) => updateMetric(i, { label: e.target.value })} placeholder="Orders" className={field} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => set("metrics", cs.metrics.filter((_, j) => j !== i))}
              className="mt-1 text-slate-400 hover:text-red-400"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => set("metrics", [...cs.metrics, { label: "", value: "" }])}
          className={addButton}
        >
          <Plus size={14} className="mr-1" /> Add result
        </Button>
      </Section>

      <Section title="Story">
        <div>
          <Label className="text-slate-200">The challenge</Label>
          <Textarea
            value={cs.problem}
            onChange={(e) => set("problem", e.target.value)}
            rows={3}
            placeholder="Where things stood when I arrived, and what had to change."
            className={field}
          />
        </div>
        <div>
          <Label className="text-slate-200">What I did</Label>
          <Textarea
            value={cs.approach}
            onChange={(e) => set("approach", e.target.value)}
            rows={6}
            placeholder="What I built and changed, in plain words."
            className={field}
          />
        </div>
        <div>
          <Label className="text-slate-200">What I learned</Label>
          <Textarea
            value={cs.learnings}
            onChange={(e) => set("learnings", e.target.value)}
            rows={3}
            placeholder="What didn't work, and what I would do differently."
            className={field}
          />
        </div>
      </Section>

      <Section title="Testimonial">
        <Textarea
          value={cs.testimonial.quote}
          onChange={(e) => set("testimonial", { ...cs.testimonial, quote: e.target.value })}
          rows={2}
          placeholder="A short quote from the client or manager"
          className={field}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input value={cs.testimonial.author} onChange={(e) => set("testimonial", { ...cs.testimonial, author: e.target.value })} placeholder="Name" className={field} />
          <Input value={cs.testimonial.role} onChange={(e) => set("testimonial", { ...cs.testimonial, role: e.target.value })} placeholder="Role, company" className={field} />
        </div>
      </Section>
    </div>
  )
}
