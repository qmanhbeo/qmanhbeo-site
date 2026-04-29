import type { NoteEntry } from "@/content/entries"
import noteBuildingGaia from "./note-building-gaia"
import noteDesignStillMatters from "./note-design-still-matters"
import noteEnergyPovertyTransition from "./note-energy-poverty-transition"
import noteManhMemorySystemFrustrationStocks from "./note-manh-memory-system-frustration-stocks"
import noteHousingListingsTaughtMe from "./note-housing-listings-taught-me"
import noteMarketSandbox from "./note-market-sandbox"
import noteProcurementRecordsWhisper from "./note-procurement-records-whisper"
import noteStoriesThatRememberYou from "./note-stories-that-remember-you"
import noteWhatBirminghamChanged from "./note-what-birmingham-changed"

export const noteEntries = [
  noteMarketSandbox,
  noteBuildingGaia,
  noteProcurementRecordsWhisper,
  noteHousingListingsTaughtMe,
  noteStoriesThatRememberYou,
  noteEnergyPovertyTransition,
  noteWhatBirminghamChanged,
  noteDesignStillMatters,
  noteManhMemorySystemFrustrationStocks,
] satisfies NoteEntry[]
