import { defineCard } from "../define.js";

export default defineCard({
  name: "Cavern Whisperer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  mutate: "{3}{B}",
  text: "Mutate {3}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nMenace (This creature can't be blocked except by two or more creatures.)\nWhenever this creature mutates, each opponent discards a card.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "Whenever this creature mutates, each opponent discards a card.",
    },
  ],
});
