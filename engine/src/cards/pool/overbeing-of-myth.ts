import { defineCard } from "../define.js";

// EDHREC rank 17399.

export default defineCard({
  name: "Overbeing of Myth",
  manaCost: "{G/U}{G/U}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 0,
  toughness: 0,
  text: "Overbeing of Myth's power and toughness are each equal to the number of cards in your hand.\nAt the beginning of your draw step, draw an additional card.",
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0 },
      text: "Overbeing of Myth's power and toughness are each equal to the number of cards in your hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "At the beginning of your draw step, draw an additional card.",
    },
  ],
});
