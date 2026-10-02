"use client";

import type { ReactNode } from "react";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy } from "@/lib/portfolio";
import type { CaseStudy as CaseStudyData } from "@/lib/projects";

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

/** Results and story for a project. Each section renders only when it has content. */
export default function CaseStudy({ data }: { data: CaseStudyData }) {
  const { copy } = usePortfolioCopy();
  const t = copy.caseStudy;

  const story = [
    { title: t.problem, body: data.problem },
    { title: t.approach, body: data.approach },
    { title: t.learnings, body: data.learnings },
  ].filter((section) => section.body.trim());

  return (
    <div className="case-study">
      {data.metrics.length > 0 && (
        <Block title={t.results}>
          <div className="case-metrics">
            {data.metrics.map((metric, i) => (
              <div key={i} className="case-metric">
                <p className="case-metric-value">{metric.value}</p>
                <p className="case-metric-label">{metric.label}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {story.map((section) => (
        <Block key={section.title} title={section.title}>
          <p className="detail-summary">{section.body}</p>
        </Block>
      ))}

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
