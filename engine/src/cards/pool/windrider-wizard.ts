import { defineCard } from "../define.js";

// Rulings:
//   A Wizard spell is one with the creature type Wizard.
//   You draw a card and discard a card while the last ability is resolving.

const TEXT =
  "Whenever you cast an instant, sorcery, or Wizard spell, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Windrider Wizard",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
