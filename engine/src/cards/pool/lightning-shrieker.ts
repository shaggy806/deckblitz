import { defineCard } from "../define.js";

// Every end step, not only its controller's. Only if it's still on the
// battlefield as the ability resolves (the ruling).

export default defineCard({
  name: "Lightning Shrieker",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample", "haste"],
  text: "Flying, trample, haste\nAt the beginning of the end step, this creature's owner shuffles it into their library.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: "At the beginning of the end step, this creature's owner shuffles it into their library.",
    },
  ],
});
