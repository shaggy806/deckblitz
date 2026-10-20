import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 7242. Braids, Cabal Minion's shape: "that
// player" is the player whose upkeep it is.
const TEXT = "At the beginning of each player's upkeep, that player sacrifices a non-Elf creature of their choice.";

export default defineCard({
  name: "Ruthless Winnower",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "active-player",
        filter: { type: "creature", notSubtypes: ["Elf"] },
        count: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
