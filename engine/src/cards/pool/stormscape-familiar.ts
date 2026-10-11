import { defineCard } from "../define.js";

// EDHREC rank 6811.
//
// Rulings:
//   The effect is cumulative.
//   This can lower the cost to zero, but not below zero.
//   Can never affect the colored part of the cost.
//   If a spell is both white and black, you pay {1} less, not {2} less.
//   The lower cost is not optional like with some other cost reducers.
//
// Nightscape Familiar's shape: one reduction for a spell that's white, black
// or both.

const COST_TEXT = "White spells and black spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Stormscape Familiar",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${COST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { anyOf: [{ colors: ["W"] }, { colors: ["B"] }] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
});
