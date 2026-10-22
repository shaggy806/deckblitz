import { defineCard } from "../define.js";

const TEXT = "Whenever you cycle or discard another card, scry 1.";

export default defineCard({
  name: "Curator of Mysteries",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}\nCycling {U} ({U}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  cycling: { cost: "{U}" },
});
