import { defineCard } from "../define.js";

// The creature's controller is read as it last existed
// on the battlefield (rule 608.2h).

const TEXT = "Destroy target creature. Its controller discards a card.";

export default defineCard({
  name: "Assassin's Strike",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "discard", target: { controllerOfTarget: 0 }, amount: 1 },
    ],
  },
});
