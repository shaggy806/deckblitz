import { defineCard } from "../define.js";

export default defineCard({
  name: "Corpsehatch",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target nonblack creature. Create two 0/1 colorless Eldrazi Spawn creature tokens. They have \"Sacrifice this token: Add {C}.\"",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "create-token", token: "Eldrazi Spawn Token", count: 2 },
    ],
  },
});
