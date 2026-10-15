import { defineCard } from "../define.js";

export default defineCard({
  name: "Venom's Hunger",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if you control a Villain.\nDestroy target creature. You gain 2 life.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Villain" }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
