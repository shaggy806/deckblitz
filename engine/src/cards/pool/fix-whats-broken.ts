import { defineCard } from "../define.js";

// EDHREC rank 10165.
//
// Rulings:
//   [2026-03-20] If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.

// X is the life paid (Toxic Deluge's `payLifeX`). The mana value compare is a
// `{ amount: "x" }` operand, bound to that X as the effect applies. A card
// with {X} in its cost has mana value with X = 0 in the graveyard (the
// ruling, rule 202.3e). Every match returns at once.
export default defineCard({
  name: "Fix What's Broken",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, pay X life.\n" +
    "Return each artifact and creature card with mana value X from your graveyard to the battlefield.",
  additionalCost: { payLifeX: true },
  effect: {
    kind: "return-from-graveyard",
    filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "eq", n: { amount: "x" } } },
    destination: "battlefield",
    count: "all",
  },
});
