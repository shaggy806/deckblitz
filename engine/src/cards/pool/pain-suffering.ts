import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27036. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both colours. Never cast
// itself; a spell is one half or the other (pain.ts, suffering.ts).
const FACES = ["Pain // Suffering", "Pain", "Suffering"];

export default defineCard({
  name: "Pain // Suffering",
  manaCost: "{B}{3}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Target player discards a card.\n//\nDestroy target land.",
  faces: FACES,
  split: true,
});
