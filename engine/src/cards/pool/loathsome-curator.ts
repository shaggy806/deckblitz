import { defineCard } from "../define.js";

export default defineCard({
  name: "Loathsome Curator",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon", "Wizard"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nMenace\nWhen this creature exploits a creature, destroy target creature you don't control with mana value 3 or less.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: {
          kind: "sacrifice",
          who: "you",
          filter: { type: "creature" },
          count: 1,
          exploit: true,
        },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature exploits a creature, destroy target creature you don't control with mana value 3 or less.",
    },
  ],
});
