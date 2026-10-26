import { defineCard } from "../define.js";

// EDHREC rank 16611.

export default defineCard({
  name: "Sister Repentia",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 5,
  toughness: 1,
  miracle: { cost: "{W}{B}" },
  text: "Martyrdom — When this creature dies, you gain 2 life and draw two cards.\nMiracle {W}{B} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 2 },
        ],
      },
      resolve: null,
      text: "Martyrdom — When this creature dies, you gain 2 life and draw two cards.",
    },
  ],
});
