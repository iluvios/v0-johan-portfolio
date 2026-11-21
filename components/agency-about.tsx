"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/portfolio-motion";
import { Eyebrow, PageIntro } from "@/components/portfolio-ui";
import { AgencyCta, AgencySection } from "@/components/agency/sections";
import { useLanguage } from "@/contexts/language-context";
import { aboutCopy, TEAM } from "@/lib/agency/about";
import { agencyHomeCopy } from "@/lib/agency/copy";
import { STACK } from "@/lib/site";

export default function AgencyAbout() {
  const { language } = useLanguage();
  const copy = aboutCopy[language];
  const home = agencyHomeCopy[language];

  return (
    <div className="page-shell">
      <PageIntro eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <AgencySection id="team" eyebrow={copy.teamEyebrow} title={copy.teamTitle}>
        <ul className="agency-team">
          {TEAM.map((member, i) => {
            const person = copy.team[member.id];
            return (
              <li key={member.id}>
                <Reveal className="agency-member" delay={i * 0.08}>
                  <div className="agency-member-photo">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={`${member.name}, ${person.role}`}
                        width={640}
                        height={800}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="agency-member-initial" aria-hidden="true">
                        {member.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="agency-member-text">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3>{member.name}</h3>
                        <p className="agency-member-role">{person.role}</p>
                        <p className="agency-member-years">{copy.years(member.years)}</p>
                      </div>
                      {member.link && (
                        <a
                          href={member.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="agency-member-link"
                        >
                          {copy.portfolio}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p>{person.body}</p>
                    <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {person.tags.map((tag) => (
                        <li key={tag}>
                          <Badge variant="tag">{tag}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </AgencySection>

      <section className="section agency-section" aria-labelledby="story-heading">
        <Reveal className="agency-story">
          <Eyebrow>{copy.storyEyebrow}</Eyebrow>
          <h2 id="story-heading" className="agency-title">
            {copy.storyTitle}
          </h2>
          <p>{copy.storyBody}</p>
          <Link className="text-link" href="/projects">
            {copy.storyWork}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <AgencySection id="principles" eyebrow={copy.principlesEyebrow} title={copy.principlesTitle}>
        <div className="agency-principles">
          {copy.principles.map((item, i) => (
            <Reveal key={item.title} className="agency-card h-full" delay={i * 0.06}>
              <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </AgencySection>

      <section className="agency-section pt-0" aria-label={copy.toolsLabel}>
        <div className="flex flex-col gap-4">
          <p className="eyebrow">{copy.toolsLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {STACK.map((tool) => (
              <li key={tool}>
                <Badge variant="tag">{tool}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <AgencyCta
          eyebrow={home.ctaEyebrow}
          title={home.ctaTitle}
          body={home.ctaBody}
          button={home.ctaButton}
        />
      </div>
    </div>
  );
}
