import type { NoteEntry } from "@/content/entries"
import noteManhMemorySystemFrustrationStocks from "./note-manh-memory-system-frustration-stocks"
import noteRemoteWslVivaLaVida from "./note-remote-wsl-viva-la-vida"
import noteSagradaFamiliaGaia from "./note-sagrada-familia-gaia"
import noteLightHardtLion from "./note-light-hardt-lion"
import noteWormVegLine from "./note-worm-veg-line"
import noteOupBooks from "./note-oup-books"
import notePicnicBirmingham from "./note-picnic-birmingham"
import noteBuddhismValencia from "./note-buddhism-valencia"
import noteThoOiMassPsychosisis from "./note-tho-oi-mass-psychosisis"

const NOTE_ORDER: Record<string, number> = {
  // Pinned: Light-Hardt Lion always first
  "note-light-hardt-lion": 1,
  "note-tho-oi-mass-psychosisis": 2,
  "note-worm-veg-line": 3,
  "note-oup-books": 4,
  "note-manh-memory-system-frustration-stocks": 5,
  "note-remote-wsl-viva-la-vida": 6,
  "note-picnic-birmingham": 7,
  "note-sagrada-familia-gaia": 8,
  "note-buddhism-valencia": 9,
}

const allNotes = [
  noteLightHardtLion,
  noteThoOiMassPsychosisis,
  noteWormVegLine,
  noteOupBooks,
  noteManhMemorySystemFrustrationStocks,
  noteRemoteWslVivaLaVida,
  notePicnicBirmingham,
  noteSagradaFamiliaGaia,
  noteBuddhismValencia,
]

export const noteEntries = [...allNotes].sort((a, b) => {
  const orderA = NOTE_ORDER[a.slug] ?? 999
  const orderB = NOTE_ORDER[b.slug] ?? 999
  return orderA - orderB
}) satisfies NoteEntry[]