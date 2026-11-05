import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 15483. The reflexive ability triggers only if all three were
// milled, and X is read as it resolves (the rulings).

const TEXT =
  "When this creature enters, mill three cards. When you do, target creature an opponent controls gets -X/-X until end of turn, where X is the greatest mana value among cards in your graveyard.";

const MINUS_X: EffectAmount = {
  product: [{ aggregate: "max", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" }, -1],
};

export default defineCard({
  name: "Wick's Patrol",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Warlock"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 3 },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature-an-opponent-controls"],
              effect: { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
              text: "Target creature an opponent controls gets -X/-X until end of turn, where X is the greatest mana value among cards in your graveyard.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
