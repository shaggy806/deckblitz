import { defineCard } from "../define.js";

// Mogg Salvage's `freeCastIf`, with the land types the other way round.

export default defineCard({
  name: "Saprazzan Legate",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "If an opponent controls a Mountain and you control an Island, you may cast this spell without paying its mana cost.\nFlying",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Mountain" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      ],
    },
  },
});
