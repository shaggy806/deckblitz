import { defineCard } from "../define.js";

// EDHREC rank 12735.

export default defineCard({
  name: "Drannith Stinger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  cycling: { cost: "{1}" },
  text: "Whenever you cycle another card, this creature deals 1 damage to each opponent.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  triggered: [
    {
      trigger: { on: "cycles", who: "you", otherOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever you cycle another card, this creature deals 1 damage to each opponent.",
    },
  ],
});
