import { defineCard } from "../define.js";

export default defineCard({
  name: "Audacious Thief",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, you draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "Whenever this creature attacks, you draw a card and you lose 1 life.",
    },
  ],
});
