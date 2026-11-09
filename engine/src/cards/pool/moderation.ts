import { defineCard } from "../define.js";

// `prohibits.castLimit`: every spell you cast this turn counts, the ones before
// Moderation was yours and Moderation itself included (the rulings), and a
// spell an effect tells you to cast is barred too.
export default defineCard({
  name: "Moderation",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "You can't cast more than one spell each turn.\nWhenever you cast a spell, draw a card.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "you", limit: 1 }],
      text: "You can't cast more than one spell each turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you cast a spell, draw a card.",
    },
  ],
});
