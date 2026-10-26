import { defineCard } from "../define.js";

// EDHREC rank 28726.
//
// Rulings:
//   [2011-09-22] You don't have priority between untapping Civilized Scholar and transforming it.
//     You can't activate the draw-and-discard ability again, for example.
//
// Lord Windgrace's "if a [type] card is discarded this way" check.

const TEXT =
  "{T}: Draw a card, then discard a card. If a creature card is discarded this way, untap this creature, then transform it.";

export default defineCard({
  name: "Civilized Scholar",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { type: "creature" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap", target: "source" },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Civilized Scholar", "Homicidal Brute"],
  transform: true,
});
