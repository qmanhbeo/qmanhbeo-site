import { notFound } from "next/navigation"
import { getEntryBySlug } from "@/content/entries"
import ItemPageContent from "@/app/item/[slug]/ItemPageContent"

interface ItemModalPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ItemModalPage({ params }: ItemModalPageProps) {
  const { slug } = await params
  const entry = getEntryBySlug(slug)

  if (!entry) {
    notFound()
  }

  return <ItemPageContent entry={entry} presentation="modal" />
}
