"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { useProject, usePortfolioCopy, safeWebsite } from "@/lib/portfolio";
import {
  ContentLoading,
  ContentEmpty,
  MissingContent,
  Eyebrow,
} from "@/components/portfolio-ui";
import ProjectGallery from "@/components/project-gallery";
import { Reveal } from "@/components/portfolio-motion";

export default function ProjectDetail({ id }: { id: number }) {
  const { copy } = usePortfolioCopy();
  const { data: project, isLoading, error, mutate } = useProject(id);
  if (isLoading)
    return (
      <div className="page-shell section min-h-screen">
        <ContentLoading detail />
      </div>
    );
  if (error)
    return (
      <div className="page-shell section">
        <ContentEmpty error onReset={() => mutate()} />
      </div>
    );
  if (!project) return <MissingContent kind="project" />;
  const images = [
    ...new Set(
      [project.image_url, ...project.gallery].filter(
        (image): image is string =>
          Boolean(image) && !image!.includes("placeholder"),
      ),
    ),
  ];
  const website = safeWebsite(project.website_url);
  return (
    <div className="page-shell">
      <header className="detail-intro">
        <Link href="/projects" className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.backWork}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {project.category && <Eyebrow>{project.category}</Eyebrow>}
          {project.featured && <Badge variant="tag">{copy.featured}</Badge>}
        </div>
        <h1 className="detail-title">{project.title}</h1>
        {project.impact && <p className="page-description">{project.impact}</p>}
        {website && (
          <GlowButton variant="outline" asChild>
            <a href={website} target="_blank" rel="noopener noreferrer">
              {copy.live}
              <ArrowUpRight data-icon="inline-end" />
            </a>
          </GlowButton>
        )}
      </header>
      <ProjectGallery key={project.id} title={project.title} images={images} />
      <Reveal>
        <section className="detail-content">
          <div className="flex max-w-2xl flex-col gap-5">
            <h2 className="text-3xl font-medium">{copy.overview}</h2>
            {project.description && (
              <p className="detail-summary">{project.description}</p>
            )}
          </div>
          <dl className="flex min-w-48 flex-col gap-5">
            {project.client && (
              <div>
                <dt className="text-sm text-muted-foreground">{copy.client}</dt>
                <dd className="mt-1 text-base">{project.client}</dd>
              </div>
            )}
            {project.category && (
              <div>
                <dt className="text-sm text-muted-foreground">
                  {copy.category}
                </dt>
                <dd className="mt-1 text-base">{project.category}</dd>
              </div>
            )}
          </dl>
        </section>
      </Reveal>
      {project.tags.length > 0 && (
        <section className="flex flex-col gap-5 pb-12">
          <h2 className="text-2xl font-medium">{copy.skills}</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="tag">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-4 py-8">
        <Link href="/projects" className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.allWork}
        </Link>
        <Link href="/contact" className="text-link">
          {copy.talk}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
