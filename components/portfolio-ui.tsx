"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Reveal } from "@/components/portfolio-motion";
import { usePortfolioCopy, formatDate, readTimeLabel } from "@/lib/portfolio";
import type { Project } from "@/lib/projects";
import type { BlogPost } from "@/lib/blog";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-dot" aria-hidden="true" />
      {children}
    </p>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-intro">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </header>
  );
}

export function ProjectCard({
  project,
  index,
  showFeatured = true,
}: {
  project: Project;
  index?: number;
  showFeatured?: boolean;
}) {
  const { copy } = usePortfolioCopy();
  const hasImage =
    project.image_url && !project.image_url.includes("placeholder");
  return (
    <article className="project-card" id={`work-${project.id}`}>
      <Link
        href={`/projects/${project.id}`}
        className="project-image-link"
        aria-label={`${copy.viewProject}: ${project.title}`}
      >
        {hasImage ? (
          <img
            src={project.image_url!}
            alt={project.title}
            className="project-image"
            width={1200}
            height={750}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl">
            {project.client || project.title}
          </div>
        )}
        <div className="project-image-meta">
          {project.category && (
            <Badge variant="glass">{project.category}</Badge>
          )}
          {showFeatured && project.featured && (
            <Badge variant="glass">{copy.featured}</Badge>
          )}
        </div>
        <span className="project-open" aria-hidden="true">
          <ArrowUpRight size={22} />
        </span>
      </Link>
      <div className="project-caption">
        <div>
          <h3>
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
          </h3>
          {(project.impact || project.client) && (
            <p>{project.impact || project.client}</p>
          )}
        </div>
        {index !== undefined && (
          <span className="project-number" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
    </article>
  );
}

export function ArticleRow({ article }: { article: BlogPost }) {
  const { language } = usePortfolioCopy();
  return (
    <Link className="article-row" href={`/articles/${article.id}`}>
      <div className="article-row-meta">
        <span className="text-accent">{article.category}</span>
        <span>
          {formatDate(article.date, language)} ·{" "}
          {readTimeLabel(article.readTime, language)}
        </span>
      </div>
      <h3>{article.title}</h3>
      <ArrowUpRight className="shrink-0" size={24} aria-hidden="true" />
    </Link>
  );
}

export function SearchControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { copy } = usePortfolioCopy();
  return (
    <InputGroup className="max-w-md">
      <InputGroupInput
        type="search"
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <InputGroupAddon>
        <Search aria-hidden="true" />
      </InputGroupAddon>
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            className="size-11"
            aria-label={copy.clear}
            onClick={() => onChange("")}
          >
            <X aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export function ContentEmpty({
  filtered = false,
  onReset,
  error = false,
}: {
  filtered?: boolean;
  onReset?: () => void;
  error?: boolean;
}) {
  const { copy } = usePortfolioCopy();
  return (
    <Empty className="min-h-64">
      <EmptyHeader>
        <EmptyTitle>{error ? copy.loadError : copy.noResults}</EmptyTitle>
        <EmptyDescription>
          {filtered ? copy.noResultsBody : copy.emptyBody}
        </EmptyDescription>
      </EmptyHeader>
      {onReset && (
        <EmptyContent>
          <GlowButton variant="outline" onClick={onReset}>
            {error ? copy.retry : copy.reset}
          </GlowButton>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function ContentLoading({ detail = false }: { detail?: boolean }) {
  const { copy } = usePortfolioCopy();
  return (
    <div
      role="status"
      aria-label={copy.loading}
      className="flex flex-col gap-6"
    >
      <span className="sr-only">{copy.loading}</span>
      {detail && <Skeleton className="h-16 w-3/4" />}
      <div
        className={detail ? "flex flex-col gap-6" : "grid gap-8 md:grid-cols-2"}
      >
        {Array.from({ length: detail ? 1 : 2 }, (_, i) => (
          <div key={i} className="flex flex-col gap-4" aria-hidden="true">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MissingContent({ kind }: { kind: "project" | "article" }) {
  const { copy } = usePortfolioCopy();
  return (
    <div className="page-shell section">
      <div className="flex flex-col items-start gap-6">
        <Eyebrow>404</Eyebrow>
        <h1 className="page-title">{copy.notFound}</h1>
        <p className="page-description">{copy.notFoundBody}</p>
        <GlowButton asChild>
          <Link href={kind === "project" ? "/projects" : "/articles"}>
            <ArrowLeft data-icon="inline-start" />
            {kind === "project" ? copy.backWork : copy.backArticles}
          </Link>
        </GlowButton>
      </div>
    </div>
  );
}

export function ContactInvitation() {
  const { copy } = usePortfolioCopy();
  return (
    <Reveal>
      <section className="contact-invitation">
        <div className="contact-invitation-inner">
          <Eyebrow>{copy.cta}</Eyebrow>
          <h2>{copy.ctaTitle}</h2>
          <div className="flex flex-wrap items-center gap-6">
            <GlowButton asChild>
              <Link href="/contact">
                {copy.talk}
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </GlowButton>
            <p className="max-w-xs text-sm text-muted-foreground">
              {copy.ctaBody}
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
