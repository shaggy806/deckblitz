import { defineCard } from "../define.js";

// EDHREC rank 26788.
//
// Heavyweight Demolisher's upkeep `unless`, its option 1 life.
const TEXT = "At the beginning of your upkeep, tap this creature unless you pay 1 life.";

export default defineCard({
  name: "Carnophage",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ payLife: 1, text: "Pay 1 life." }],
        otherwise: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
