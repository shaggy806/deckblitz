import { defineCard } from "../define.js";

// EDHREC rank 30437. Distress with a mana-value cap read from the spell's X.
//
// Rulings:
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.

export default defineCard({
  name: "Venarian Glimmer",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player reveals their hand. You choose a nonland card with mana value X or less from it. That player discards that card.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"], manaValue: { op: "lte", n: { amount: "x" } } },
  },
});
