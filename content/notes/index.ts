import type { NoteEntry } from "@/content/entries"
import noteManhMemorySystemFrustrationStocks from "./note-manh-memory-system-frustration-stocks"
import noteRemoteWslVivaLaVida from "./note-remote-wsl-viva-la-vida"
import noteSagradaFamiliaGaia from "./note-sagrada-familia-gaia"
import noteLightHardtLion from "./note-light-hardt-lion"
import noteWormVegLine from "./note-worm-veg-line"
import noteOupBooks from "./note-oup-books"
import notePicnicBirmingham from "./note-picnic-birmingham"
import noteBuddhismValencia from "./note-buddhism-valencia"

const NOTE_ORDER: Record<string, number> = {
  "note-light-hardt-lion": 1,
  "note-worm-veg-line": 2,
  "note-oup-books": 3,
  "note-manh-memory-system-frustration-stocks": 4,
  "note-remote-wsl-viva-la-vida": 5,
  "note-picnic-birmingham": 6,
  "note-sagrada-familia-gaia": 7,
  "note-buddhism-valencia": 8,
}

const allNotes = [
  noteLightHardtLion,
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