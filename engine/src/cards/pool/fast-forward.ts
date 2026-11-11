import { defineCard } from "../define.js";

export default defineCard({
  name: "Fast Forward",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "opponents-attacked", who: "you" },
  },
  text: "This spell costs {1} less to cast for each opponent you attacked this turn.\nGoad all creatures your opponents control. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)",
  targets: [],
  effect: { kind: "goad", filter: { type: "creature", controlledBy: "opponent" } },
});
