import { defineCard } from "../define.js";

const TEXT = "Whenever you cast an instant spell, you may pay {1}. If you do, draw a card.";

export default defineCard({
  name: "Lunar Mystic",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "instant" } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to draw a card?", cost: "{1}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
