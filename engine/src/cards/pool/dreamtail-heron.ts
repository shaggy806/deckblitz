import { defineCard } from "../define.js";

// EDHREC rank 6892.

export default defineCard({
  name: "Dreamtail Heron",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Bird"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  mutate: "{3}{U}",
  text: "Mutate {3}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying\nWhenever this creature mutates, draw a card.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature mutates, draw a card.",
    },
  ],
});
