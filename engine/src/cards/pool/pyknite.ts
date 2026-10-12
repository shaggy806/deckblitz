import { defineCard } from "../define.js";

export default defineCard({
  name: "Pyknite",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 1,
  toughness: 1,
  text: "When this creature enters, draw a card at the beginning of the next turn's upkeep.",
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
