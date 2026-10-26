import { defineCard } from "../define.js";

// EDHREC rank 14645.
//
// Rulings:
//   [2024-11-08] If an opponent casts a spell that's both blue and black, Mold Adder's ability
//     triggers only once.
//   [2024-11-08] Mold Adder's ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered or otherwise leaves the stack without resolving.
export default defineCard({
  name: "Mold Adder",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Snake"],
  power: 1,
  toughness: 1,
  text: "Whenever an opponent casts a blue or black spell, you may put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Mold Adder?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever an opponent casts a blue or black spell, you may put a +1/+1 counter on this creature.",
    },
  ],
});
