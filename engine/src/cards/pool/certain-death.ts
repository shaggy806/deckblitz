import { defineCard } from "../define.js";

// EDHREC rank 24810. Sip of Hemlock's shape: the life changes hands even when
// the creature survives (indestructible), but not when the target is illegal
// (the rulings).
export default defineCard({
  name: "Certain Death",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Its controller loses 2 life and you gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: 2, toControllerOfTarget: 0 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
