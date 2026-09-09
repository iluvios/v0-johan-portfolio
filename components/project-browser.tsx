"use client";

import { useDeferredValue, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProjects, usePortfolioCopy } from "@/lib/portfolio";
import {
  PageIntro,
  SearchControl,
  ProjectCard,
  ContentLoading,
  ContentEmpty,
  ContactInvitation,
} from "@/components/portfolio-ui";
import { Reveal } from "@/components/portfolio-motion";

export default function ProjectBrowser() {
  const { copy } = usePortfolioCopy();
  const { data: projects = [], isLoading, error, mutate } = useProjects();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search.trim().toLocaleLowerCase());
  const categories = Array.from(
    new Set(
      projects
        .map((project) => project.category)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const filtered = projects.filter(
    (project) =>
      (category === "all" || project.category === category) &&
      [
        project.title,
        project.client,
        project.description,
        project.category,
        ...project.tags,
      ].some((value) => value?.toLocaleLowerCase().includes(query)),
  );
  const hasFilters = Boolean(search || category !== "all");
  function reset() {
    setSearch("");
    setCategory("all");
  }
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow={copy.selected}
        title={copy.projectsTitle}
        description={copy.projectsIntro}
      />
      <div className="listing-toolbar">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchControl
            label={copy.searchProjects}
            value={search}
            onChange={setSearch}
          />
          <p role="status" className="text-sm text-muted-foreground">
            {isLoading ? copy.loading : `${filtered.length} ${copy.results}`}
          </p>
        </div>
        <div className="filter-scroll">
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) setCategory(value);
            }}
            aria-label={copy.filter}
            className="w-max justify-start gap-2"
          >
            <ToggleGroupItem value="all">{copy.all}</ToggleGroupItem>
            {categories.map((value) => (
              <ToggleGroupItem key={value} value={value}>
                {value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      {isLoading ? (
        <ContentLoading />
      ) : error ? (
        <ContentEmpty error onReset={() => mutate()} />
      ) : filtered.length ? (
        <div className="project-grid">
          {filtered.map((project, i) => (
            <Reveal key={project.id}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      ) : (
        <ContentEmpty
          filtered={hasFilters}
          onReset={hasFilters ? reset : undefined}
        />
      )}
      <div className="section">
        <ContactInvitation />
      </div>
    </div>
  );
}
