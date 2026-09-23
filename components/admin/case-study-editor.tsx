"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Circle, Plus, Trash2, Upload } from "lucide-react"
import {
  type CaseStudy,
  type MetricSource,
  caseStudyChecklist,
  emptyCaseStudy,
} from "@/lib/projects"
import { isVideoUrl, uploadMedia } from "@/lib/media"

const field = "bg-slate-900/80 border-slate-700 text-white mt-1"
const addButton = "border-slate-700 hover:border-blue-400 text-slate-300"

const SOURCE_LABELS: Record<MetricSource, string> = {
  verified: "Verified — screenshot or report I can show",
  client: "Client-reported",
  estimate: "Estimate from memory",
}

type ListKey = "funnel" | "iterations" | "metrics" | "creatives" | "email_flows"

const EMPTY_ROWS = {
  funnel: { title: "", detail: "" },
  iterations: { label: "", change: "", result: "" },
  metrics: { label: "", value: "", source: "estimate" as MetricSource },
  creatives: { image_url: "", caption: "" },
  email_flows: { name: "", trigger: "", steps: "", result: "" },
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-slate-700/70 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-100">{title}</legend>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
    </fieldset>
  )
}

function RemoveRow({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} className="text-slate-400 hover:text-red-400">
      <Trash2 size={14} />
    </Button>
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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const checklist = caseStudyChecklist(cs)
  const done = checklist.filter((item) => item.done).length

  const set = <K extends keyof CaseStudy>(key: K, next: CaseStudy[K]) => onChange({ ...cs, [key]: next })

  const addRow = (key: ListKey) => set(key, [...cs[key], { ...EMPTY_ROWS[key] }] as never)
  const removeRow = (key: ListKey, index: number) =>
    set(key, cs[key].filter((_, i) => i !== index) as never)
  const updateRow = (key: ListKey, index: number, patch: Record<string, string>) =>
    set(key, cs[key].map((row, i) => (i === index ? { ...row, ...patch } : row)) as never)

  const handleCreativeUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIndex(index)
    setUploadError(null)
    try {
      const url = await uploadMedia(file)
      updateRow("creatives", index, { image_url: url })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div className="space-y-5 border-t border-slate-700 pt-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Case study</h3>
        <p className="mt-1 text-xs text-slate-400">
          Every section is optional and only shows on the site once it has content. Aim for the story a skeptical
          hiring manager wants: what you owned, what you changed, and how you know it worked.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-4">
        <p className="mb-2 text-sm font-medium text-slate-200">
          Completeness: {done}/{checklist.length}
        </p>
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
              ) : (
                <Circle size={14} className="text-slate-600" />
              )}
              <span className={item.done ? "text-slate-200" : "text-slate-500"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <Section title="Context">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-slate-200">Year(s)</Label>
            <Input value={cs.year} onChange={(e) => set("year", e.target.value)} placeholder="2023–2024" className={field} />
          </div>
          <div>
            <Label className="text-slate-200">Duration</Label>
            <Input value={cs.duration} onChange={(e) => set("duration", e.target.value)} placeholder="8 months" className={field} />
          </div>
        </div>
        <div>
          <Label className="text-slate-200">My role — what I personally did</Label>
          <Textarea
            value={cs.role}
            onChange={(e) => set("role", e.target.value)}
            rows={2}
            placeholder="Owned paid media and the CRM build; wrote the ad copy; briefed the designer."
            className={field}
          />
        </div>
        <div>
          <Label className="text-slate-200">Team</Label>
          <Input value={cs.team} onChange={(e) => set("team", e.target.value)} placeholder="1 designer, 1 developer, client founder" className={field} />
        </div>
        <div>
          <Label className="text-slate-200">Channels & spend</Label>
          <Input
            value={cs.channels}
            onChange={(e) => set("channels", e.target.value)}
            placeholder="Meta + Google · ~$8K/month"
            className={field}
          />
        </div>
        <p className="text-xs text-slate-400">
          Confidential client? Put an anonymized description in the Client field above, e.g. “US B2C SaaS, Series A”.
        </p>
      </Section>

      <Section title="Story">
        <div>
          <Label className="text-slate-200">Problem / goal</Label>
          <Textarea
            value={cs.problem}
            onChange={(e) => set("problem", e.target.value)}
            rows={3}
            placeholder="Where things stood when I arrived, and the one number the work had to move."
            className={field}
          />
        </div>
        <div>
          <Label className="text-slate-200">Approach</Label>
          <Textarea
            value={cs.approach}
            onChange={(e) => set("approach", e.target.value)}
            rows={4}
            placeholder="The strategy and what I built, in plain words."
            className={field}
          />
        </div>
      </Section>

      <Section title="Funnel" hint="The path from first touch to sale, in order — e.g. Ad → Landing page → Form → CRM → Email → Call.">
        {cs.funnel.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-3 w-5 text-xs text-slate-500">{i + 1}</span>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              <Input value={step.title} onChange={(e) => updateRow("funnel", i, { title: e.target.value })} placeholder="Landing page" className={field} />
              <Input
                value={step.detail}
                onChange={(e) => updateRow("funnel", i, { detail: e.target.value })}
                placeholder="Webflow, one CTA, quiz to qualify"
                className={`${field} sm:col-span-2`}
              />
            </div>
            <RemoveRow onClick={() => removeRow("funnel", i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addRow("funnel")} className={addButton}>
          <Plus size={14} className="mr-1" /> Add step
        </Button>
      </Section>

      <Section title="Iterations" hint="The core of the story: what you launched, what the data said, what you changed.">
        {cs.iterations.map((iteration, i) => (
          <div key={i} className="space-y-2 rounded-md border border-slate-700/60 p-3">
            <div className="flex items-center gap-2">
              <Input
                value={iteration.label}
                onChange={(e) => updateRow("iterations", i, { label: e.target.value })}
                placeholder="Week 1 / V2 / Month 3"
                className={field}
              />
              <RemoveRow onClick={() => removeRow("iterations", i)} />
            </div>
            <Textarea
              value={iteration.change}
              onChange={(e) => updateRow("iterations", i, { change: e.target.value })}
              rows={2}
              placeholder="What I launched or changed, and why"
              className={field}
            />
            <Input
              value={iteration.result}
              onChange={(e) => updateRow("iterations", i, { result: e.target.value })}
              placeholder="What happened — CTR 0.8% → 1.9%"
              className={field}
            />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addRow("iterations")} className={addButton}>
          <Plus size={14} className="mr-1" /> Add iteration
        </Button>
      </Section>

      <Section title="Results" hint="Every number carries its source. An honest estimate is credible; an unsourced number is not.">
        {cs.metrics.map((metric, i) => (
          <div key={i} className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[120px_1fr_200px_auto]">
            <Input value={metric.value} onChange={(e) => updateRow("metrics", i, { value: e.target.value })} placeholder="30 → 200" className={field} />
            <Input
              value={metric.label}
              onChange={(e) => updateRow("metrics", i, { label: e.target.value })}
              placeholder="Daily registrations"
              className={field}
            />
            <Select value={metric.source} onValueChange={(source) => updateRow("metrics", i, { source })}>
              <SelectTrigger className={field}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SOURCE_LABELS) as MetricSource[]).map((source) => (
                  <SelectItem key={source} value={source}>
                    {SOURCE_LABELS[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RemoveRow onClick={() => removeRow("metrics", i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addRow("metrics")} className={addButton}>
          <Plus size={14} className="mr-1" /> Add result
        </Button>
      </Section>

      <Section title="Creatives" hint="Ad images or videos (MP4, WebM, MOV up to 200 MB), landing pages, emails. The caption says the hook and how it performed.">
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        {cs.creatives.map((creative, i) => (
          <div key={i} className="flex items-start gap-3 rounded-md border border-slate-700/60 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded border border-slate-700 bg-slate-950">
              {creative.image_url &&
                (isVideoUrl(creative.image_url) ? (
                  <video src={creative.image_url} muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <img src={creative.image_url} alt="" className="h-full w-full object-cover" />
                ))}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={creative.image_url}
                  onChange={(e) => updateRow("creatives", i, { image_url: e.target.value })}
                  placeholder="Image/video URL or upload"
                  className={`${field} flex-1`}
                />
                <label className="mt-1 cursor-pointer">
                  <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleCreativeUpload(i, e)} />
                  <Button type="button" variant="outline" className={addButton} disabled={uploadingIndex === i} asChild>
                    <span>
                      <Upload size={14} className="mr-1" />
                      {uploadingIndex === i ? "…" : "File"}
                    </span>
                  </Button>
                </label>
              </div>
              <Input
                value={creative.caption}
                onChange={(e) => updateRow("creatives", i, { caption: e.target.value })}
                placeholder="Hook: loss aversion · winner, 2.1% CTR"
                className={field}
              />
            </div>
            <RemoveRow onClick={() => removeRow("creatives", i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addRow("creatives")} className={addButton}>
          <Plus size={14} className="mr-1" /> Add creative
        </Button>
      </Section>

      <Section title="Email & lifecycle flows">
        {cs.email_flows.map((flow, i) => (
          <div key={i} className="space-y-2 rounded-md border border-slate-700/60 p-3">
            <div className="flex items-center gap-2">
              <Input value={flow.name} onChange={(e) => updateRow("email_flows", i, { name: e.target.value })} placeholder="Webinar reminder sequence" className={field} />
              <RemoveRow onClick={() => removeRow("email_flows", i)} />
            </div>
            <Input value={flow.trigger} onChange={(e) => updateRow("email_flows", i, { trigger: e.target.value })} placeholder="Trigger: registered for webinar" className={field} />
            <Textarea
              value={flow.steps}
              onChange={(e) => updateRow("email_flows", i, { steps: e.target.value })}
              rows={2}
              placeholder="Email at signup → 24h reminder → SMS 1h before → replay"
              className={field}
            />
            <Input value={flow.result} onChange={(e) => updateRow("email_flows", i, { result: e.target.value })} placeholder="Attendance 20% → 55%" className={field} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addRow("email_flows")} className={addButton}>
          <Plus size={14} className="mr-1" /> Add flow
        </Button>
      </Section>

      <Section title="Learnings">
        <Textarea
          value={cs.learnings}
          onChange={(e) => set("learnings", e.target.value)}
          rows={3}
          placeholder="What didn't work, and what I would do differently."
          className={field}
        />
      </Section>

      <Section title="Testimonial / reference">
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
