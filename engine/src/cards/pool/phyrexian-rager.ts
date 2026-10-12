import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian Rager",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, you draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "When this creature enters, you draw a card and you lose 1 life.",
    },
  ],
});
