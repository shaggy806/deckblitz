import { defineCard } from "../define.js";

// Rulings:
//   [2008-08-01] The ability is put on the stack immediately after you cast a creature spell,
//     which means the creature that spell will become won't be a legal target.
//   [2008-08-01] The ability will still resolve even if the spell that triggered it gets
//     countered.

const TEXT =
  "Whenever you cast a creature spell, you may pay {1}. If you do, return target creature to its owner's hand.";

export default defineCard({
  name: "Equilibrium",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to return the target creature to its owner's hand?",
        cost: "{1}",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
