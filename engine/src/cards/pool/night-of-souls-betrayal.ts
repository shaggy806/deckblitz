import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 10755.
//
// Rulings:
//   [2017-11-17] If a second Night of Souls' Betrayal comes under your control, you'll put one
//     into its owner's graveyard due to the "legend rule" at the same time that any creatures
//     getting -2/-2 are put into their owner's graveyard for having 0 or less toughness.

export default defineCard({
  name: "Night of Souls' Betrayal",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "All creatures get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      grantPt: [-1, -1],
      text: "All creatures get -1/-1.",
    },
  ],
});
