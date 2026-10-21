import { defineCard } from "../define.js";

// Commander 2020. The mutate trigger exiles the top card of each opponent's
// library face down for its controller to look at and play while it stays
// exiled — Expensive Taste's `impulse-exile` over every opponent.

const MUTATES =
  "Whenever this creature mutates, exile the top card of each opponent's library face down. You may look at and play those cards for as long as they remain exiled.";

export default defineCard({
  name: "Mindleecher",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  mutate: "{4}{B}",
  text: `Mutate {4}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying\n${MUTATES}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-opponent",
        duration: "while-exiled",
        faceDown: true,
      },
      resolve: null,
      text: MUTATES,
    },
  ],
});
