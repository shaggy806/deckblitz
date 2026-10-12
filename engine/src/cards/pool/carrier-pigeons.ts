import { defineCard } from "../define.js";

export default defineCard({
  name: "Carrier Pigeons",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, draw a card at the beginning of the next turn's upkeep.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
      resolve: null,
      text: "When this creature enters, draw a card at the beginning of the next turn's upkeep.",
    },
  ],
});
