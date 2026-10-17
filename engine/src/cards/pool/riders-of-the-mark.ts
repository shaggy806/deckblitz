import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 8393.
// Makes Human Soldier → use "Human Soldier Token".
//
// Rulings:
//   [2023-11-03] If Riders of the Mark leaves the battlefield before its triggered ability
//     resolves, you can't return it to its owner's hand from its new zone.
//   [2023-11-03] You won't create tokens if Riders of the Mark is returned to your hand by an
//     effect other than its own  triggered ability.
//   [2023-11-03] Use Riders of the Mark's toughness as it last existed on the battlefield to
//     determine how many 1/1 white Human Soldier creature tokens to create.

export default defineCard({
  name: "Riders of the Mark",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 7,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: "Affinity for Humans (This spell costs {1} less to cast for each Human you control.)\nTrample, haste\nAt the beginning of your end step, if this creature attacked this turn, return it to its owner's hand. If you do, create a number of 1/1 white Human Soldier creature tokens equal to its toughness.",
  selfCostReduction: affinity({ subtype: "Human" }),
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { attackedThisTurn: true } },
      targets: [],
      // Only its own return makes tokens, and only from the battlefield (the
      // rulings); the toughness is the one it last had there (rule 608.2h).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "create-token", token: "Human Soldier Token", count: { toughnessOf: "source" } },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your end step, if this creature attacked this turn, return it to its owner's hand. If you do, create a number of 1/1 white Human Soldier creature tokens equal to its toughness.",
    },
  ],
});
