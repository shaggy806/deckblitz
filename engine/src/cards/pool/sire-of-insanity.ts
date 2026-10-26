import { defineCard } from "../define.js";

// EDHREC rank 8989.

const TEXT = "At the beginning of each end step, each player discards their hand.";

export default defineCard({
  name: "Sire of Insanity",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "discard-hand", who: "each-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
