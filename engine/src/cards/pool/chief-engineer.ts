import { defineCard } from "../define.js";

const TEXT =
  "Artifact spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting an artifact spell pays for {1} or one mana of that creature's color.)";

// Convoke on each artifact spell as it's cast (rule 702.51); another
// instance is redundant, and it goes with an alternative cost (its rulings).
export default defineCard({
  name: "Chief Engineer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Artificer"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, grantsToSpells: { filter: { type: "artifact" }, convoke: true }, text: TEXT }],
});
