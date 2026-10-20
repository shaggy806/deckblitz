import { defineCard } from "../define.js";

// Each spell is read as it was cast (`cast-this-turn`), so a countered one
// still counts (the ruling). The tokens are created, not investigated.
export default defineCard({
  name: "Fae Offering",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of each end step, if you've cast both a creature spell and a noncreature spell this turn, create a Clue token, a Food token, and a Treasure token.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "all",
        of: [
          { kind: "cast-this-turn", filter: { type: "creature" } },
          { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
        ],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Clue Token", count: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: "At the beginning of each end step, if you've cast both a creature spell and a noncreature spell this turn, create a Clue token, a Food token, and a Treasure token.",
    },
  ],
});
