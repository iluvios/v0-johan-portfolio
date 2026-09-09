import type { Metadata } from "next";
import ArticleDetail from "@/components/article-detail";

export const metadata: Metadata = {
  title: "An idea worth exploring",
  description:
    "Notes and perspectives on marketing, automation, and digital innovation by Johan Alvarez.",
};
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticleDetail id={id} />;
}
