"use client";

import type { ReactNode } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy } from "@/lib/portfolio";
import type { CaseStudy as CaseStudyData } from "@/lib/projects";
import { isVideoUrl } from "@/lib/media";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal>
      <section className="case-block">
        <h2 className="case-heading">{title}</h2>
        {children}
      </section>
    </Reveal>
  );
}

/** Long-form story for a project. Each section renders only when it has content. */
export default function CaseStudy({ data }: { data: CaseStudyData }) {
  const { copy } = usePortfolioCopy();
  const t = copy.caseStudy;

  const glance = [
    { label: t.year, value: data.year },
    { label: t.duration, value: data.duration },
    { label: t.channels, value: data.channels },
    { label: t.team, value: data.team },
  ].filter((item) => item.value.trim());

  return (
    <div className="case-study">
      {(glance.length > 0 || data.role.trim()) && (
        <Block title={t.glance}>
          <dl className="case-glance">
            {glance.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
            {data.role.trim() && (
              <div className="case-glance-wide">
                <dt>{t.role}</dt>
                <dd>{data.role}</dd>
              </div>
            )}
          </dl>
        </Block>
      )}

      {data.metrics.length > 0 && (
        <Block title={t.results}>
          <div className="case-metrics">
            {data.metrics.map((metric, i) => (
              <div key={i} className="case-metric">
                <p className="case-metric-value">{metric.value}</p>
                <p className="case-metric-label">{metric.label}</p>
                <Badge
                  variant="tag"
                  className={metric.source === "verified" ? "border-accent/50 text-accent" : undefined}
                >
                  {t.sources[metric.source]}
                </Badge>
              </div>
            ))}
          </div>
          <p className="case-note">{t.sourceNote}</p>
        </Block>
      )}

      {(data.problem.trim() || data.approach.trim()) && (
        <div className="case-story">
          {data.problem.trim() && (
            <Block title={t.problem}>
              <p className="detail-summary">{data.problem}</p>
            </Block>
          )}
          {data.approach.trim() && (
            <Block title={t.approach}>
              <p className="detail-summary">{data.approach}</p>
            </Block>
          )}
        </div>
      )}

      {data.funnel.length > 0 && (
        <Block title={t.funnel}>
          <ol className="case-funnel">
            {data.funnel.map((step, i) => (
              <li key={i} className="case-funnel-step">
                <span className="case-step-index">{String(i + 1).padStart(2, "0")}</span>
                <p className="case-step-title">{step.title}</p>
                {step.detail && <p className="case-step-detail">{step.detail}</p>}
                {i < data.funnel.length - 1 && (
                  <ArrowRight className="case-step-arrow" size={16} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </Block>
      )}

      {data.iterations.length > 0 && (
        <Block title={t.iterations}>
          <ol className="case-timeline">
            {data.iterations.map((iteration, i) => (
              <li key={i}>
                <p className="case-timeline-label">{iteration.label}</p>
                {iteration.change && <p className="case-timeline-change">{iteration.change}</p>}
                {iteration.result && <p className="case-timeline-result">{iteration.result}</p>}
              </li>
            ))}
          </ol>
        </Block>
      )}

      {data.creatives.length > 0 && (
        <Block title={t.creatives}>
          <div className="case-creatives">
            {data.creatives.map((creative, i) => (
              <figure key={i}>
                {isVideoUrl(creative.image_url) ? (
                  <video src={creative.image_url} controls playsInline preload="metadata" />
                ) : (
                  <img src={creative.image_url} alt={creative.caption || t.creatives} loading="lazy" />
                )}
                {creative.caption && <figcaption>{creative.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </Block>
      )}

      {data.email_flows.length > 0 && (
        <Block title={t.emailFlows}>
          <div className="case-flows">
            {data.email_flows.map((flow, i) => (
              <article key={i} className="case-flow">
                <h3>{flow.name}</h3>
                {flow.trigger && (
                  <p className="case-flow-trigger">
                    {t.trigger}: {flow.trigger}
                  </p>
                )}
                {flow.steps && <p className="case-flow-steps">{flow.steps}</p>}
                {flow.result && <p className="case-timeline-result">{flow.result}</p>}
              </article>
            ))}
          </div>
        </Block>
      )}

      {data.learnings.trim() && (
        <Block title={t.learnings}>
          <p className="detail-summary">{data.learnings}</p>
        </Block>
      )}

      {data.testimonial.quote.trim() && (
        <Reveal>
          <blockquote className="case-quote">
            <Quote size={20} aria-hidden="true" className="text-accent" />
            <p>{data.testimonial.quote}</p>
            {(data.testimonial.author || data.testimonial.role) && (
              <footer>
                {data.testimonial.author}
                {data.testimonial.author && data.testimonial.role && " · "}
                {data.testimonial.role}
              </footer>
            )}
          </blockquote>
        </Reveal>
      )}
    </div>
  );
}
