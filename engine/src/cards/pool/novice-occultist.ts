import { defineCard } from "../define.js";

export default defineCard({
  name: "Novice Occultist",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, you draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "When this creature dies, you draw a card and you lose 1 life.",
    },
  ],
});
