import { defineCard } from "../define.js";

export default defineCard({
  name: "Knockout Blow",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "This spell costs {2} less to cast if it targets a red creature.\n" +
    "Knockout Blow deals 4 damage to target attacking or blocking creature and you gain 2 life.",
  targets: ["attacking-or-blocking-creature"],
  targetCostReduction: { filter: { type: "creature", colors: ["R"] }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
