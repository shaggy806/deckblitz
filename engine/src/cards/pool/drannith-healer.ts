import { defineCard } from "../define.js";

// EDHREC rank 13427.

export default defineCard({
  name: "Drannith Healer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{1}" },
  text: "Whenever you cycle another card, you gain 1 life.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  triggered: [
    {
      trigger: { on: "cycles", who: "you", otherOnly: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever you cycle another card, you gain 1 life.",
    },
  ],
});
