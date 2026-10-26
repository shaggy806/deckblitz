import { defineCard } from "../define.js";

// EDHREC rank 18333.
//
// Rulings:
//   [2009-10-01] If you have two Xathrid Demons, both abilities will trigger at the beginning of
//     your upkeep. When the first Demon's ability resolves, you can sacrifice the second Demon to
//     satisfy the requirement. When the second Demon's ability resolves, you must sacrifice
//     another creature. If you can't, you lose 7 life, regardless of whether the second Demon is
//     still on the battlefield at this time.
//   [2009-10-01] When the ability resolves, if you control any other creatures, you must sacrifice
//     one of them. You lose life only if no creature can be sacrificed.
//
// The sacrificed creature's power is read as it last existed on the battlefield; a negative
// power makes no one lose (or gain) life, hence the `difference` floor at 0 (rule 107.1b).
const UPKEEP =
  "At the beginning of your upkeep, sacrifice a creature other than this creature, then each opponent loses life equal to the sacrificed creature's power. If you can't sacrifice a creature, tap this creature and you lose 7 life.";

export default defineCard({
  name: "Xathrid Demon",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exceptSource: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atMost: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "tap", target: "source" },
                { kind: "lose-life", amount: 7, who: "you" },
              ],
            },
            else: {
              kind: "lose-life",
              amount: { difference: [{ thisWay: "sacrificed", sumOf: "power" }, 0] },
              who: "each-opponent",
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
