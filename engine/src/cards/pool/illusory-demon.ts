import { defineCard } from "../define.js";

// EDHREC rank 31407.
//
// Rulings:
//   [2009-05-01] If you cast a spell, the spell goes on the stack, then Illusory Demon's triggered
//     ability goes on the stack on top of it. The triggered ability will resolve (and you'll
//     sacrifice Illusory Demon) before the spell resolves.
export default defineCard({
  name: "Illusory Demon",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Demon", "Illusion"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen you cast a spell, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you cast a spell, sacrifice this creature.",
    },
  ],
});
