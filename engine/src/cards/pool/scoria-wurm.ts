import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 21203.

const TEXT =
  "At the beginning of your upkeep, flip a coin. If you lose the flip, return this creature to its owner's hand.";

export default defineCard({
  name: "Scoria Wurm",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "return-to-hand", target: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
