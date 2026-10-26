import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 17914. Subversion's trigger, word for word.

const TEXT =
  "At the beginning of your upkeep, each opponent loses 1 life. You gain life equal to the life lost this way.";

export default defineCard({
  name: "Agent of Masks",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
