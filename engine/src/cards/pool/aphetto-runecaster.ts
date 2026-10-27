import { defineCard } from "../define.js";

// Rulings:
//   [2007-05-01] Triggers when any permanent is turned face up, not just a creature.

const TEXT = "Whenever a permanent is turned face up, you may draw a card.";

export default defineCard({
  name: "Aphetto Runecaster",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "any" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
