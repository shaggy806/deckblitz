import { defineCard } from "../define.js";

export default defineCard({
  name: "Chittering Harvester",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 6,
  mutate: "{4}{B}",
  text: "Mutate {4}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, each opponent sacrifices a creature of their choice.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "Whenever this creature mutates, each opponent sacrifices a creature of their choice.",
    },
  ],
});
