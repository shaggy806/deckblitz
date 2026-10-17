import { defineCard } from "../define.js";

export default defineCard({
  name: "Arwen's Gift",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {1} less to cast if you control two or more legendary creatures.\nScry 2, then draw two cards.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 2 },
    reduceGeneric: 1,
  },
  targets: [],
  effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } },
});
