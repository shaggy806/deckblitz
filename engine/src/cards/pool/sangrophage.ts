import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 30041. Carnophage's upkeep at 2 life.
//
// Rulings:
//   [2021-03-19] You choose whether or not to pay 2 life as the triggered ability resolves. You
//     can pay 2 life even if Sangrophage is already tapped.

const TEXT = "At the beginning of your upkeep, tap this creature unless you pay 2 life.";

export default defineCard({
  name: "Sangrophage",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ payLife: 2, text: "Pay 2 life." }], otherwise: { kind: "tap", target: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
