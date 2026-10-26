import { defineCard } from "../define.js";

export default defineCard({
  name: "Structural Collapse",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target player sacrifices an artifact and a land of their choice. Structural Collapse deals 2 damage to that player.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "artifact" }, count: 1, andEach: [{ type: "land" }] },
      { kind: "damage", amount: 2, target: 0 },
    ],
  },
});
