import { defineCard } from "../define.js";

// EDHREC rank 20297. Modern Horizons 3.
//
// Devoid is `colors: []`. The cast trigger resolves before the creature
// spell does, and still resolves if the spell is countered (the ruling).
//
// Rulings:
//   [2024-06-07] Petrifying Meddler's triggered ability will resolve before Petrifying Meddler
//     does. If Petrifying Meddler is countered or otherwise leaves the stack in response to that
//     triggered ability, the triggered ability will still resolve as normal.

const CAST_TEXT =
  "When you cast this spell, tap up to one target creature and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Petrifying Meddler",
  manaCost: "{4}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\nReach`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
