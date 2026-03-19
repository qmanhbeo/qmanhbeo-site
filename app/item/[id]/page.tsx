import type { Metadata } from "next"
import ItemPageContent from "./ItemPageContent"

export const metadata: Metadata = {
  title: "Archive Entry",
}

export default function ItemPage({ params }: { params: { id: string } }) {
  return <ItemPageContent id={params.id} />
}
