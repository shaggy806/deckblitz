import { defineCard } from "../define.js";

// EDHREC rank 27172.

export default defineCard({
  name: "Inspired Fire",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each card you've drawn this turn.\nInspired Fire deals 4 damage to target creature.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "cards-drawn", who: "you" },
  },
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
