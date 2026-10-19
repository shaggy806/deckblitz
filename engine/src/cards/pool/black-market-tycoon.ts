import { defineCard } from "../define.js";

// It triggers with no Treasures too, and counts them as it resolves (the
// ruling).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, this creature deals 2 damage to you for each Treasure you control.";

export default defineCard({
  name: "Black Market Tycoon",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${UPKEEP_TEXT}\n{T}: Create a Treasure token.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countOf: { subtype: "Treasure", controlledBy: "you" }, times: 2 },
        who: "you",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "{T}: Create a Treasure token.",
    },
  ],
});
