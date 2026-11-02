import { defineCard } from "../define.js";

export default defineCard({
  name: "Wildvine Pummeler",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 6,
  toughness: 5,
  keywords: ["reach", "trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { colorsAmong: { controlledBy: "you" } },
  },
  text: "Vivid — This spell costs {1} less to cast for each color among permanents you control.\nReach, trample",
});
