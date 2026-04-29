import type { NoteEntry } from "@/content/entries"

const noteBuildingGaia: NoteEntry = {
  slug: "note-building-gaia",
  type: "note",
  order: 2,
  title: "Building GAIA from the Ground Up",
  subtitle: "Starting with a world before starting with a policy",
  dateLabel: "Apr 2025 - Present",
  noteLabel: "Research note",
  summary:
    "GAIA begins not with an algorithm, but with a world: households, labour, food, water, and constraints that push back when policy dreams get too simple.",
  body: [
    "I wanted a simulation where policy ideas had to answer to households, scarcity, and the possibility of unintended consequences. That meant starting with a world and its constraints before worrying about any optimizing agent.",
    "GAIA is still taking shape, but the guiding rule is stable: systems should reveal trade-offs instead of hiding them behind elegant abstractions.",
    "The work keeps returning me to the same conviction. Allocation problems become more interesting, and more honest, when they are tested against interdependence rather than isolated metrics.",
  ],
  tags: ["GAIA", "Agent-Based Modelling", "Resource Allocation", "Simulation"],
}

export default noteBuildingGaia
