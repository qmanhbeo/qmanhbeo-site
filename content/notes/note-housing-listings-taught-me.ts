import type { NoteEntry } from "@/content/entries"

const noteHousingListingsTaughtMe: NoteEntry = {
  slug: "note-housing-listings-taught-me",
  type: "note",
  order: 4,
  title: "What 201K Housing Listings Taught Me",
  subtitle: "Large datasets are really collections of small lies to fix",
  dateLabel: "Mar 2025 - Sep 2025",
  noteLabel: "Data note",
  summary:
    "A large dataset is rarely just scale. It is error handling, strange formats, missing values, and the discipline to keep cleaning until the picture stops lying.",
  excerpt:
    "A large dataset is never just a large dataset. It is error handling, missing values, checkpoints, strange formats, and the discipline to keep cleaning until the picture stops lying.",
  body: [
    "The housing pipeline reinforced a simple lesson: size does not create clarity. It amplifies every weakness in the collection and cleaning process until the errors begin to look like patterns.",
    "The work was slow because trust had to be earned row by row through parsing, normalization, and decisions about what should and should not be repaired automatically.",
    "That discipline is what made the final dataset useful. Not the raw count, but the refusal to pretend that messy inputs were already telling the truth.",
  ],
  tags: ["Real Estate", "Data Cleaning", "Listings", "Analysis"],
}

export default noteHousingListingsTaughtMe
