import type { NoteEntry } from "@/content/entries"

const noteProcurementRecordsWhisper: NoteEntry = {
  slug: "note-procurement-records-whisper",
  type: "note",
  order: 3,
  title: "What Procurement Records Whisper",
  subtitle: "Following public links until they become evidence",
  dateLabel: "Nov 2025",
  noteLabel: "Project note",
  summary:
    "Procurement records rarely arrive analysis-ready; the real work is gathering fragments, tracking provenance, and persuading them into coherence.",
  excerpt:
    "Public procurement data rarely arrives in the shape analysis wants. This was the slow work of following raw links, gathering fragments, and persuading them into something coherent.",
  body: [
    "Public data is often treated as if availability were the same thing as usability. Procurement records taught me the opposite. The documents existed, but the structure needed for analysis had to be built by hand.",
    "Most of the effort went into following links, checking context, and preserving enough provenance for later questions to remain answerable.",
    "What emerged was less a dataset dropped from above than a record of patient assembly. That process is part of the result, not a prelude to it.",
  ],
  tags: ["Procurement", "Public Records", "Data Collection", "Policy"],
}

export default noteProcurementRecordsWhisper
