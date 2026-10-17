import { defineCard } from "../define.js";

// EDHREC rank 18607.

export default defineCard({
  name: "High Fae Negotiator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Warlock"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nFlying\nWhen this creature enters, if it was bargained, each opponent loses 3 life and you gain 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "each-opponent" },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: "When this creature enters, if it was bargained, each opponent loses 3 life and you gain 3 life.",
      condition: { kind: "self-kicked" },
    },
  ],
});
