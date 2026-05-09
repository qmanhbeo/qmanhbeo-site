import type { NoteEntry } from "@/content/entries"
import noteNautilus from "./note-nautilus"
import noteManhMemorySystemFrustrationStocks from "./note-manh-memory-system-frustration-stocks"
import noteRemoteWslVivaLaVida from "./note-remote-wsl-viva-la-vida"
import noteSagradaFamiliaGaia from "./note-sagrada-familia-gaia"
import noteLightHardtLion from "./note-light-hardt-lion"
import noteWormVegLine from "./note-worm-veg-line"
import noteOupBooks from "./note-oup-books"
import notePicnicBirmingham from "./note-picnic-birmingham"
import noteBuddhismValencia from "./note-buddhism-valencia"
import noteAutonomousResearchLabScience from "./note-autonomous-research-lab-science"
import noteThoOiMassPsychosisis from "./note-tho-oi-mass-psychosisis"
import noteGeometryOfBrotherhood from "./note-geometry-of-brotherhood"
import noteToTheEndOfLanguage from "./note-to-the-end-of-language"
import noteEarlyInternetVibes from "./note-early-internet-vibes"

const NOTE_ORDER: Record<string, number> = {
  // Pinned: Light-Hardt Lion always first
  "note-light-hardt-lion": 1,
  "note-nautilus": 2,
  "note-tho-oi-within-outside-perception": 3,
  "note-worm-veg-line": 4,
  "note-oup-books": 5,
  "note-manh-memory-system-frustration-stocks": 6,
  "note-remote-wsl-viva-la-vida": 7,
  "note-picnic-birmingham": 8,
  "note-sagrada-familia-gaia": 9,
  "note-buddhism-valencia": 10,
  "note-autonomous-research-lab-science": 11,
  "note-geometry-of-brotherhood": 12,
  "note-to-the-end-of-language": 13,
  "note-early-internet-vibes": 14,
}

const allNotes = [
  noteNautilus,
  noteLightHardtLion,
  noteThoOiMassPsychosisis,
  noteWormVegLine,
  noteOupBooks,
  noteManhMemorySystemFrustrationStocks,
  noteRemoteWslVivaLaVida,
  notePicnicBirmingham,
  noteSagradaFamiliaGaia,
  noteBuddhismValencia,
  noteAutonomousResearchLabScience,
  noteGeometryOfBrotherhood,
  noteToTheEndOfLanguage,
  noteEarlyInternetVibes,
]

export const noteEntries = [...allNotes].sort((a, b) => {
  const orderA = NOTE_ORDER[a.slug] ?? 999
  const orderB = NOTE_ORDER[b.slug] ?? 999
  return orderA - orderB
}) satisfies NoteEntry[]