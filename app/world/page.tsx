import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import WorldScreen from "@/app/world/_components/WorldScreen";

export const metadata: Metadata = {
  title: "By the Hearth | Manh's Interactive World",
  description:
    "An interactive personal world by Manh, connecting AI research, sustainability, simulations, writing, travel, and creative projects. Explore the digital realm.",
  alternates: {
    canonical: `${SITE_URL}/world`,
  },
  openGraph: {
    title: "By the Hearth | Manh's Interactive World",
    description:
      "An interactive personal world by Manh, connecting AI research, sustainability, simulations, writing, travel, and creative projects.",
    url: `${SITE_URL}/world`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "By the Hearth | Manh's Interactive World",
    description:
      "An interactive personal world by Manh, connecting AI research, sustainability, simulations, writing, travel, and creative projects.",
  },
};

export default function WorldPage() {
  return (
    <>
      <section className="sr-only" aria-label="About By the Hearth">
        <h1>By the Hearth</h1>
        <p>
          An interactive personal world by Manh, connecting AI research, sustainability,
          simulations, writing, travel, and creative projects.
        </p>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/world">World</Link>
        </nav>
      </section>
      <WorldScreen />
    </>
  );
}
