import { defineCard } from "../define.js";

export default defineCard({
  name: "Renewed Faith",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{1}{W}" },
  text: "You gain 6 life.\nCycling {1}{W} ({1}{W}, Discard this card: Draw a card.)\nWhen you cycle this card, you may gain 2 life.",
  effect: { kind: "gain-life", amount: 6 },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "may", prompt: "Gain 2 life?", effect: { kind: "gain-life", amount: 2 } },
      resolve: null,
      text: "When you cycle this card, you may gain 2 life.",
    },
  ],
});
