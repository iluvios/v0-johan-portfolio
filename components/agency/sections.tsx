"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  CircleDollarSign,
  Facebook,
  Globe,
  Inbox,
  Instagram,
  Mail,
  MessageCircle,
  PiggyBank,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  Unplug,
  UserRound,
  Zap,
  type LucideProps,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Reveal } from "@/components/portfolio-motion";
import { Eyebrow } from "@/components/portfolio-ui";
import type {
  Faq,
  FunnelStage,
  MockCopy,
  ProofItem,
  StatItem,
  TitledText,
} from "@/lib/agency/copy";
import { EXAMPLE_PLAN_IDS, EXAMPLE_PLANS, formatUsd, quote } from "@/lib/agency/pricing";
import type { AgencyHomeCopy } from "@/lib/agency/copy";
import { AGENCY_CTA_HREF } from "@/lib/site";
import { aboutCopy, TEAM } from "@/lib/agency/about";

type Icon = ComponentType<LucideProps>;

const CTA_EXTERNAL = AGENCY_CTA_HREF.startsWith("http");
export const ctaLinkProps = {
  href: AGENCY_CTA_HREF,
  ...(CTA_EXTERNAL ? { target: "_blank", rel: "noopener noreferrer" } : {}),
};

/** Fades and lifts in when scrolled into view. Used for small, decorative sequences. */
export function Appear({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </m.div>
  );
}

/** Counts up from 0 when it first scrolls into view. Server HTML shows the final number. */
function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (reduce || !el || el.getBoundingClientRect().top < window.innerHeight) return;
    setDisplay(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1100);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduce]);
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function AgencySection({
  id,
  eyebrow,
  title,
  intro,
  aside,
  align = "start",
  className,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  aside?: ReactNode;
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={["section agency-section", className].filter(Boolean).join(" ")}
      aria-labelledby={`${id}-heading`}
    >
      <div className={align === "center" ? "agency-heading agency-heading--center" : "agency-heading"}>
        <div className="flex flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-heading`} className="agency-title">
            {title}
          </h2>
          {intro && <p className="agency-intro">{intro}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function NumberedGrid({ items }: { items: TitledText[] }) {
  return (
    <div className="agency-numbered">
      {items.map((item, i) => (
        <Reveal key={item.title} className="agency-numbered-item" delay={i * 0.06}>
          <span className="service-index">{String(i + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

const FUNNEL_ICONS: Icon[] = [Search, Globe, MessageCircle, TrendingUp];

export function FunnelGrid({
  stages,
}: {
  stages: (Omit<FunnelStage, "tags"> & { tags?: string[] })[];
}) {
  return (
    <ol className="agency-funnel">
      {stages.map((stage, i) => {
        const Icon = FUNNEL_ICONS[i % FUNNEL_ICONS.length];
        return (
          <li key={stage.stage}>
            <Reveal className="agency-card h-full" delay={i * 0.07}>
              <span className="agency-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="agency-stage">
                {String(i + 1).padStart(2, "0")} · {stage.stage}
              </span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
              {stage.items ? (
                <ul className="agency-deliverables">
                  {stage.items.map((item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : stage.tags && (
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {stage.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="tag">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}

export function StatGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="proof-grid agency-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="proof-item">
          <dt className="proof-label">{stat.label}</dt>
          <dd className="proof-value">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatBand({
  intro,
  stats,
  source,
}: {
  intro: string;
  stats: StatItem[];
  source: string;
}) {
  return (
    <div className="agency-statband">
      <p className="agency-statband-intro">{intro}</p>
      <dl className="agency-statband-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="agency-statband-item">
            <dt>{stat.label}</dt>
            <dd>
              <CountUp value={stat.value} suffix={stat.suffix} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="agency-statband-source">{source}</p>
    </div>
  );
}

const PROBLEM_ICONS: Icon[] = [Timer, Unplug, CircleDollarSign];

export function IconCards({ items }: { items: TitledText[] }) {
  return (
    <div className="agency-problems">
      {items.map((item, i) => {
        const Icon = PROBLEM_ICONS[i % PROBLEM_ICONS.length];
        return (
          <Reveal key={item.title} className="agency-problem" delay={i * 0.08}>
            <span className="agency-icon agency-icon--warn">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

const CHANNEL_ICONS: Icon[] = [Globe, MessageCircle, Instagram, Facebook, Mail];
const POINT_ICONS: Icon[] = [Inbox, Zap, UserRound];

function SystemMock({ mock }: { mock: MockCopy }) {
  return (
    <div className="agency-mock" aria-label={mock.label} role="img">
      <span className="agency-mock-label">{mock.label}</span>
      <ul className="agency-mock-channels" aria-hidden="true">
        {mock.channels.map((channel, i) => {
          const Icon = CHANNEL_ICONS[i % CHANNEL_ICONS.length];
          return (
            <li key={channel} className={i === 2 ? "is-active" : undefined}>
              <Icon size={15} />
              <span>{channel}</span>
            </li>
          );
        })}
      </ul>
      <div className="agency-mock-body" aria-hidden="true">
        <div className="agency-mock-thread">
          <p className="agency-mock-thread-title">
            <Instagram size={14} /> {mock.thread}
          </p>
          {mock.messages.map((message, i) => (
            <Appear
              key={message.text}
              delay={0.25 + i * 0.55}
              // Full class names so Tailwind keeps them (it drops classes built from strings).
              className={
                message.from === "customer"
                  ? "agency-bubble agency-bubble--customer"
                  : "agency-bubble agency-bubble--assistant"
              }
            >
              {message.text}
            </Appear>
          ))}
          <Appear delay={0.25 + mock.messages.length * 0.55} className="agency-mock-booked">
            <CalendarCheck size={15} /> {mock.booked}
          </Appear>
        </div>
        <div className="agency-mock-contact">
          <div className="agency-mock-contact-head">
            <span className="agency-avatar">{mock.contact.slice(0, 1)}</span>
            <span>
              <strong>{mock.contact}</strong>
              <span className="agency-mock-crm">CRM</span>
            </span>
          </div>
          <dl>
            {mock.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="sr-only">
        {mock.messages.map((message) => message.text).join(" ")} {mock.booked}
      </p>
    </div>
  );
}

export function ConnectedSystem({
  id,
  eyebrow,
  title,
  intro,
  points,
  mock,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  points: TitledText[];
  mock: MockCopy;
}) {
  return (
    <section id={id} className="section agency-section" aria-labelledby={`${id}-heading`}>
      <div className="agency-connected">
        <div className="agency-connected-copy">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-heading`} className="agency-title">
            {title}
          </h2>
          <p className="agency-intro">{intro}</p>
          <ul className="agency-points">
            {points.map((point, i) => {
              const Icon = POINT_ICONS[i % POINT_ICONS.length];
              return (
                <li key={point.title}>
                  <span className="agency-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{point.title}</strong>
                    <span>{point.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <Reveal className="agency-connected-visual">
          <SystemMock mock={mock} />
        </Reveal>
      </div>
    </section>
  );
}

export function Pillars({ items, language }: { items: TitledText[]; language: "en" | "es" }) {
  const icons: Icon[] = language === "es" ? [BadgeCheck, Sparkles, PiggyBank] : [BadgeCheck, Rocket, PiggyBank];
  return (
    <div className="agency-pillars">
      {items.map((item, i) => {
        const Icon = icons[i % icons.length];
        return (
          <Reveal key={item.title} className="agency-pillar" delay={i * 0.08}>
            <span className="agency-icon">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h3 className="agency-pillar-word">{item.title}</h3>
            <p>{item.body}</p>
          </Reveal>
        );
      })}
    </div>
  );
}

function ProofBody({ item, tag }: { item: ProofItem; tag?: string }) {
  return (
    <>
      <span className="agency-proof-client">
        {item.client}
        {item.href && <ArrowUpRight size={16} aria-hidden="true" />}
      </span>
      <span className="agency-proof-value">{item.value}</span>
      <span className="agency-proof-label">{item.label}</span>
      <span className="proof-context">
        {tag ? `${tag} · ` : ""}
        {item.context}
      </span>
    </>
  );
}

export function ProofShowcase({
  items,
  caseStudy,
  tag,
}: {
  items: ProofItem[];
  caseStudy: string;
  tag?: string;
}) {
  const featured = items.filter((item) => item.image).slice(0, 3);
  const rest = items.filter((item) => !featured.includes(item));
  return (
    <div className="flex flex-col gap-4">
      {featured.length > 0 && (
        <ul className="agency-proof-feature">
          {featured.map((item, i) => (
            <li key={item.client}>
              <Reveal className="h-full" delay={i * 0.07}>
                <Link
                  href={item.href ?? "#"}
                  className="agency-proof-card"
                  aria-label={`${caseStudy}: ${item.client}, ${item.value} ${item.label}`}
                >
                  <span className="agency-proof-media">
                    <img src={item.image} alt="" loading="lazy" decoding="async" width={800} height={420} />
                  </span>
                  <span className="agency-proof-text">
                    <ProofBody item={item} tag={tag} />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <ul className="agency-proof-mini">
          {rest.map((item) => (
            <li key={item.client}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="agency-proof-mini-item"
                  aria-label={`${caseStudy}: ${item.client}, ${item.value} ${item.label}`}
                >
                  <ProofBody item={item} tag={tag} />
                </Link>
              ) : (
                <div className="agency-proof-mini-item">
                  <ProofBody item={item} tag={tag} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Steps({ items }: { items: TitledText[] }) {
  return (
    <ol className="agency-steps">
      {items.map((item, i) => (
        <li key={item.title}>
          <Reveal className="agency-step" delay={i * 0.1}>
            <span className="agency-step-number">{i + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function PlanCards({ copy }: { copy: AgencyHomeCopy }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <ul className="agency-plans">
        {EXAMPLE_PLAN_IDS.map((id, i) => {
          const plan = copy.plans[id];
          const price = quote({ ...EXAMPLE_PLANS[id], payment: "monthly" });
          const recommended = id === "growth";
          return (
            <li key={id}>
              <Reveal className="h-full" delay={i * 0.08}>
                <div className={recommended ? "agency-plan agency-plan--recommended h-full" : "agency-plan h-full"}>
                <div className="flex items-center justify-between gap-3">
                  <h3>{plan.name}</h3>
                  {recommended && <span className="agency-plan-badge">{copy.planRecommended}</span>}
                </div>
                <p className="agency-plan-body">{plan.body}</p>
                <p className="agency-plan-price">
                  {formatUsd(price.monthlyDue)}
                  <span>{copy.planMonthly}</span>
                </p>
                <p className="agency-plan-setup">
                  + {formatUsd(price.setupDue)} {copy.planSetup}{" "}
                  {price.setupDiscounted && <s>{formatUsd(price.setupFull)}</s>}
                </p>
                <ul className="agency-plan-items">
                  {plan.items.map((item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <GlowButton asChild variant={recommended ? "default" : "outline"} className="mt-auto w-full justify-center">
                  <Link href={`/services?plan=${id}#pricing`}>{copy.planCta}</Link>
                </GlowButton>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
      <p className="agency-plans-includes">
        <BadgeCheck size={18} aria-hidden="true" />
        {copy.planIncludes}
      </p>
      <p className="agency-plans-note">{copy.commissionNote}</p>
      <Link href="/services#pricing" className="text-link">
        {copy.planCustom}
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="agency-faq">
      {items.map((item) => (
        <details key={item.q}>
          <summary>
            <span>{item.q}</span>
            <Plus size={20} aria-hidden="true" />
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Faq[];
}) {
  return (
    <section id="faq" className="section agency-section" aria-labelledby="faq-heading">
      <div className="agency-faq-layout">
        <div className="agency-faq-heading">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id="faq-heading" className="agency-title">
            {title}
          </h2>
        </div>
        <FaqList items={items} />
      </div>
    </section>
  );
}

export function AgencyCta({
  eyebrow,
  title,
  body,
  button,
}: {
  eyebrow: string;
  title: string;
  body: string;
  button: string;
}) {
  return (
    <Reveal>
      <section className="agency-cta" aria-label={eyebrow}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
        <p>{body}</p>
        <GlowButton asChild size="lg">
          <Link {...ctaLinkProps}>
            {button}
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </GlowButton>
      </section>
    </Reveal>
  );
}

export function FitSection({
  eyebrow,
  title,
  intro,
  listTitle,
  list,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  listTitle: string;
  list: string[];
}) {
  return (
    <section id="fit" className="section agency-section" aria-labelledby="fit-heading">
      <div className="agency-fit">
        <div className="agency-fit-copy">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id="fit-heading" className="agency-title">
            {title}
          </h2>
          <p>{intro}</p>
        </div>
        <Reveal className="agency-fit-card">
          <p className="agency-fit-card-title">{listTitle}</p>
          <ul className="agency-checklist">
            {list.map((item) => (
              <li key={item}>
                <span className="agency-check" aria-hidden="true">
                  <Check size={14} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** The three specialists, shown small above the pillars on the home and services pages. */
export function TeamRow({ language }: { language: "en" | "es" }) {
  const roles = aboutCopy[language].team;
  return (
    <ul className="agency-teamrow">
      {TEAM.map((member) => (
        <li key={member.id} className="agency-teammate">
          {member.photo ? (
            <img
              src={member.photo}
              alt=""
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="agency-teammate-photo"
            />
          ) : (
            <span className="agency-teammate-photo" aria-hidden="true" />
          )}
          <span>
            <span className="agency-teammate-name">{member.name}</span>
            <span className="agency-teammate-role">{roles[member.id].role}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
