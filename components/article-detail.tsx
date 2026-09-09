"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Share2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlowButton } from "@/components/ui/glow-button";
import { Separator } from "@/components/ui/separator";
import { ReadingProgress } from "@/components/portfolio-motion";
import {
  ContentEmpty,
  ContentLoading,
  MissingContent,
} from "@/components/portfolio-ui";
import {
  useArticle,
  usePortfolioCopy,
  formatDate,
  readTimeLabel,
} from "@/lib/portfolio";

function inlineMarkdown(text: string) {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

function MarkdownContent({
  content,
  title,
}: {
  content: string;
  title: string;
}) {
  const elements: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  function flushParagraph() {
    if (paragraph.length) {
      elements.push(
        <p key={`p-${elements.length}`}>
          {inlineMarkdown(paragraph.join(" "))}
        </p>,
      );
      paragraph = [];
    }
  }
  function flushList() {
    if (list.length) {
      elements.push(
        <ul key={`l-${elements.length}`}>
          {list.map((item, index) => (
            <li key={index}>{inlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  }
  for (const line of content.split("\n")) {
    const text = line.trim();
    if (!text) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^#{1,3} /.test(text)) {
      flushParagraph();
      flushList();
      const level = text.match(/^#+/)![0].length;
      const heading = text.replace(/^#{1,3} /, "");
      if (
        level === 1 &&
        heading.trim().toLowerCase() === title.trim().toLowerCase()
      )
        continue;
      elements.push(
        level === 3 ? (
          <h3 key={`h-${elements.length}`}>{inlineMarkdown(heading)}</h3>
        ) : (
          <h2 key={`h-${elements.length}`}>{inlineMarkdown(heading)}</h2>
        ),
      );
    } else if (/^[-*] /.test(text)) {
      flushParagraph();
      list.push(text.slice(2));
    } else {
      flushList();
      paragraph.push(text);
    }
  }
  flushParagraph();
  flushList();
  return <div className="markdown-content">{elements}</div>;
}

function ShareArticle({ title, excerpt }: { title: string; excerpt: string }) {
  const { copy } = usePortfolioCopy();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [pending, setPending] = useState(false);
  async function share() {
    if (pending) return;
    setPending(true);
    setStatus("idle");
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: excerpt,
            url: window.location.href,
          });
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="flex flex-col items-start gap-3">
      <GlowButton variant="outline" onClick={share} disabled={pending}>
        {status === "copied" ? (
          <Check data-icon="inline-start" />
        ) : (
          <Share2 data-icon="inline-start" />
        )}
        {status === "copied" ? copy.copied : copy.share}
      </GlowButton>
      <span className="text-sm text-muted-foreground" role="status">
        {status === "error"
          ? copy.shareFailed
          : status === "copied"
            ? copy.copied
            : ""}
      </span>
    </div>
  );
}

export default function ArticleDetail({ id }: { id: string }) {
  const { copy, language } = usePortfolioCopy();
  const { data: article, isLoading, error, mutate } = useArticle(id);
  if (isLoading)
    return (
      <div className="reading-shell section min-h-screen">
        <ContentLoading detail />
      </div>
    );
  if (error)
    return (
      <div className="reading-shell section">
        <ContentEmpty error onReset={() => mutate()} />
      </div>
    );
  if (!article) return <MissingContent kind="article" />;
  return (
    <article className="reading-shell pb-12">
      <ReadingProgress />
      <header className="detail-intro">
        <Link href="/articles" className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.backArticles}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="text-accent">{article.category}</span>
          <time dateTime={article.date}>
            {formatDate(article.date, language)}
          </time>
          <span>{readTimeLabel(article.readTime, language)}</span>
        </div>
        <h1 className="detail-title">{article.title}</h1>
        <p className="page-description">
          {article.excerpt.split(/(?<=[.!?])\s+/)[0]}
        </p>
        <p className="text-sm text-muted-foreground">Johan Alvarez</p>
      </header>
      {article.image && (
        <img
          className="reading-cover"
          src={article.image}
          alt=""
          width={1200}
          height={675}
        />
      )}
      <MarkdownContent content={article.content} title={article.title} />
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-8" aria-label={copy.tags}>
          {article.tags.map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <Separator />
      <div className="flex flex-wrap items-start justify-between gap-5 py-8">
        <ShareArticle title={article.title} excerpt={article.excerpt} />
        <Link className="text-link" href="/articles">
          {copy.allArticles}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
