"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  useArticles,
  usePortfolioCopy,
  formatDate,
  readTimeLabel,
} from "@/lib/portfolio";
import {
  PageIntro,
  SearchControl,
  ArticleRow,
  ContentLoading,
  ContentEmpty,
} from "@/components/portfolio-ui";
import { Reveal } from "@/components/portfolio-motion";

export default function ArticleBrowser() {
  const { copy, language } = usePortfolioCopy();
  const { data: articles = [], isLoading, error, mutate } = useArticles();
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search.trim().toLocaleLowerCase());
  const filtered = articles.filter((article) =>
    [article.title, article.excerpt, article.category, ...article.tags].some(
      (value) => value.toLocaleLowerCase().includes(query),
    ),
  );
  const [lead, ...rest] = filtered;
  return (
    <div className="page-shell pb-16 md:pb-24">
      <PageIntro
        eyebrow={copy.journal}
        title={copy.articlesTitle}
        description={copy.articlesIntro}
      />
      <div className="listing-toolbar">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SearchControl
            label={copy.searchArticles}
            value={search}
            onChange={setSearch}
          />
          <p role="status" className="text-sm text-muted-foreground">
            {isLoading ? copy.loading : `${filtered.length} ${copy.results}`}
          </p>
        </div>
      </div>
      {isLoading ? (
        <ContentLoading />
      ) : error ? (
        <ContentEmpty error onReset={() => mutate()} />
      ) : lead ? (
        <>
          <Reveal>
            <article className="article-lead">
              {lead.image && (
                <Link
                  href={`/articles/${lead.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img
                    src={lead.image}
                    alt=""
                    width={1000}
                    height={625}
                    className="article-lead-image"
                  />
                </Link>
              )}
              <div className="article-lead-copy">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="text-accent">{lead.category}</span>
                  <span>{formatDate(lead.date, language)}</span>
                </div>
                <h2>
                  <Link href={`/articles/${lead.id}`}>{lead.title}</Link>
                </h2>
                <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                  {lead.excerpt.split(/(?<=[.!?])\s+/)[0]}
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  <Link href={`/articles/${lead.id}`} className="text-link">
                    {copy.readArticle}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {readTimeLabel(lead.readTime, language)}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
          {rest.map((article) => (
            <Reveal key={article.id}>
              <ArticleRow article={article} />
            </Reveal>
          ))}
        </>
      ) : (
        <ContentEmpty
          filtered={Boolean(search)}
          onReset={search ? () => setSearch("") : undefined}
        />
      )}
    </div>
  );
}
