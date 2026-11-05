import { defineCard } from "../define.js";

// EDHREC rank 19733.

export default defineCard({
  name: "Great Fierce Bee",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever one or more other creatures die, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true, batched: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Whenever one or more other creatures die, scry 1.",
    },
  ],
});
