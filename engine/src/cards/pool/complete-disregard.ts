import { defineCard } from "../define.js";

export default defineCard({
  name: "Complete Disregard",
  manaCost: "{2}{B}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nExile target creature with power 3 or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
  effect: { kind: "exile", target: 0 },
});
