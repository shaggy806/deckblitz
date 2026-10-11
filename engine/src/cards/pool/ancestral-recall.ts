import { defineCard } from "../define.js";

// Banned in Commander, in the pool for casual decks. Also Emeritus of
// Ideation's prepare spell (rule 722). "Target player" — yourself, usually.
export default defineCard({
  name: "Ancestral Recall",
  // Pinned: Scryfall answers "Ancestral Recall" by name with Emeritus of Ideation // Ancestral Recall, whose
  // prepare spell or adventure shares the name.
  art: "2398892d-28e9-4009-81ec-0d544af79d2b",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player draws three cards.",
  targets: ["player"],
  effect: { kind: "draw", amount: 3, target: 0 },
});
