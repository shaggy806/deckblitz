import { defineCard } from "../define.js";

export default defineCard({
  name: "Harsh Sustenance",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Harsh Sustenance deals X damage to any target and you gain X life, where X is the number of creatures you control.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { countOf: { type: "creature", controlledBy: "you" } }, target: 0 },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
    ],
  },
});
