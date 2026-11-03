import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, you may look at the top card of target opponent's library. If you do, you may put that card on the bottom of that player's library.";

export default defineCard({
  name: "Precognition",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Look at the top card of that opponent's library?",
        effect: {
          kind: "look-and-choose",
          from: { target: 0 },
          zone: "library",
          count: 1,
          min: 0,
          max: 1,
          destination: "library-bottom",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
