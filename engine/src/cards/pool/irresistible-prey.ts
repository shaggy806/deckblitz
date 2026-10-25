import { defineCard } from "../define.js";

export default defineCard({
  name: "Irresistible Prey",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature must be blocked this turn if able.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
      { kind: "draw", amount: 1 },
    ],
  },
});
