import { defineCard } from "../define.js";

// EDHREC rank 11436. Fix What's Broken's return, X from the mana cost.
//
// Rulings:
//   [2013-01-24] If a creature card in a graveyard has X in its mana cost, that X is considered to
//     be 0.

export default defineCard({
  name: "Immortal Servitude",
  manaCost: "{X}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Return each creature card with mana value X from your graveyard to the battlefield.",
  effect: {
    kind: "return-from-graveyard",
    filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
    destination: "battlefield",
    count: "all",
  },
});
