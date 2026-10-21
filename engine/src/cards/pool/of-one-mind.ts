import { defineCard } from "../define.js";

// EDHREC rank 12260. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Once you announce that you're casting Of One Mind, no player may take actions
//     until the spell has been paid for.
//   [2020-04-17] Of One Mind is unaffected if you no longer control a Human and non-Human creature
//     after you've cast it.
//
// Two creatures are needed: a changeling is a Human, so it can't also be the
// non-Human one.

export default defineCard({
  name: "Of One Mind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if you control a Human creature and a non-Human creature.\nDraw two cards.",
  selfCostReduction: {
    condition: {
      kind: "all",
      of: [
        { kind: "controls", filter: { type: "creature", subtype: "Human" }, atLeast: 1 },
        { kind: "controls", filter: { type: "creature", notSubtypes: ["Human"] }, atLeast: 1 },
      ],
    },
    reduceGeneric: 2,
  },
  effect: { kind: "draw", amount: 2 },
});
