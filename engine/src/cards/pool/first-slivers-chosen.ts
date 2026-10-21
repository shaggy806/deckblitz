import { defineCard } from "../define.js";

// EDHREC rank 17036.
//
// Rulings:
//   [2019-06-14] Whenever a creature you control attacks alone, count the number of instances of
//     exalted among permanents you control.
//
// Each Sliver gets its own exalted trigger (Merchant of Truth's shape), so N
// Slivers are N instances, each +1/+1 — this one included, a Sliver itself.

const EXALTED_TEXT =
  "Sliver creatures you control have exalted. (Whenever a creature you control attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents you control.)";

export default defineCard({
  name: "First Sliver's Chosen",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: EXALTED_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks-alone", who: "you-control" },
          targets: [],
          effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)",
        },
      ],
      text: EXALTED_TEXT,
    },
  ],
});
