import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllEntries, getEntryBySlug } from "@/content/entries"
import ItemPageContent from "./ItemPageContent"

interface ItemPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntryBySlug(slug)

  if (!entry) {
    return {
      title: "Archive Entry",
    }
  }

  return {
    title: `${entry.title} | Manh's Cozy Corner`,
    description: entry.summary,
  }
}

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({
    slug: entry.slug,
  }))
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { slug } = await params
  const entry = getEntryBySlug(slug)

  if (!entry) {
    notFound()
  }

  return <ItemPageContent entry={entry} />
}
