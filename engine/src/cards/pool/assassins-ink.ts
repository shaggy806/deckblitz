import { defineCard } from "../define.js";

export default defineCard({
  name: "Assassin's Ink",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  selfCostReduction: [
    { condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 }, reduceGeneric: 1 },
    { condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 }, reduceGeneric: 1 },
  ],
  text: "This spell costs {1} less to cast if you control an artifact and {1} less to cast if you control an enchantment.\nDestroy target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
