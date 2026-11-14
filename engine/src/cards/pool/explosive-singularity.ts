import { defineCard } from "../define.js";

// EDHREC rank 10056. Each creature tapped takes {1} off the total cost (rule
// 601.2f), never the {R}{R}; any number may be tapped even past that (the
// ruling).

const COST_TEXT =
  "As an additional cost to cast this spell, you may tap any number of untapped creatures you control. This spell costs {1} less to cast for each creature tapped this way.";
const DAMAGE_TEXT = "Explosive Singularity deals 10 damage to any target.";

export default defineCard({
  name: "Explosive Singularity",
  manaCost: "{8}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${COST_TEXT}\n${DAMAGE_TEXT}`,
  additionalCost: {
    also: {
      text: "Tap any number of untapped creatures you control",
      tapAnyNumber: { filter: { type: "creature" }, reducesGeneric: 1 },
    },
  },
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: 10 },
});
