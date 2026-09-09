import type { Metadata } from "next";
import ArticleBrowser from "@/components/article-browser";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Ideas on marketing, technology, and the things Johan Alvarez learns along the way.",
};

export default function ArticlesPage() {
  return <ArticleBrowser />;
}
