import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30065. Saprazzan Legate's
// `freeCastIf`, Island against Forest.

export default defineCard({
  name: "Rushwood Legate",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 1,
  text: "If an opponent controls an Island and you control a Forest, you may cast this spell without paying its mana cost.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Island" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
      ],
    },
  },
});
