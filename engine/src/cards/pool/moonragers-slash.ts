import { defineCard } from "../define.js";

export default defineCard({
  name: "Moonrager's Slash",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it's night.\nMoonrager's Slash deals 3 damage to any target.",
  // The game's day/night designation (rule 731.1): neither, before it first
  // becomes day or night, isn't night.
  selfCostReduction: { condition: { kind: "day-night", is: "night" }, reduceGeneric: 2 },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
