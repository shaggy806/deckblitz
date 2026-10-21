import { defineCard } from "../define.js";

export default defineCard({
  name: "Blood Curdle",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature. Put a menace counter on a creature you control. (It can't be blocked except by two or more creatures.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      // Chosen as it resolves, after the destruction — not a target (its rulings).
      {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a creature you control to put a menace counter on",
        then: { kind: "add-counter", target: 0, counter: "menace", amount: 1 },
      },
    ],
  },
});
