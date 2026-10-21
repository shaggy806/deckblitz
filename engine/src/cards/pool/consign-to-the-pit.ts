import { defineCard } from "../define.js";

export default defineCard({
  name: "Consign to the Pit",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Consign to the Pit deals 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
