import { defineCard } from "../define.js";

export default defineCard({
  name: "Tithebearer Giant",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 5,
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
