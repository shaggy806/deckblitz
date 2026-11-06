import { defineCard } from "../define.js";

// EDHREC rank 32683.

export default defineCard({
  name: "Red Alert!",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  selfCostReduction: {
    condition: {
      kind: "controls",
      filter: { type: "creature", attackingYou: true },
      atLeast: 1,
      anyController: true,
    },
    reduceGeneric: 2,
  },
  text: "This spell costs {2} less to cast if a creature is attacking you.\nCreatures you control get +2/+0 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
