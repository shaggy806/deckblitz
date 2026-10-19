import { defineCard } from "../define.js";

const TEXT = "When this creature leaves the battlefield, you draw two cards and each opponent draws a card.";

export default defineCard({
  name: "Clockwork Fox",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Fox"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "draw", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
