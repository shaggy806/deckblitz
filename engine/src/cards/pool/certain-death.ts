import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 24810.
//
// Sip of Hemlock's shape plus the life gain. The creature is gone before the
// life changes hands; an indestructible one that isn't destroyed still costs
// its controller 2 life, while an illegal target stops the whole spell (the
// rulings).
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
