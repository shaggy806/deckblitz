import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 16331.

const TEXT = "When this creature leaves the battlefield, you may pay {2}. If you do, draw a card.";

export default defineCard({
  name: "Papercraft Decoy",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Frog"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to draw a card?",
        cost: "{2}",
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
