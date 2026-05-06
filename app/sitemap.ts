import type { MetadataRoute } from "next";
import { getAllEntries } from "@/content/entries";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = getAllEntries();

  const itemUrls = entries.map((entry) => ({
    url: `${SITE_URL}/item/${entry.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/world`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...itemUrls,
  ];
}