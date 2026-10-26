import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] It will only return if it is still on the battlefield when the triggered ability
//     resolves.

export default defineCard({
  name: "Jackalope Herd",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rabbit", "Beast"],
  power: 4,
  toughness: 5,
  text: "When you cast a spell, return this creature to its owner's hand.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "When you cast a spell, return this creature to its owner's hand.",
    },
  ],
});
