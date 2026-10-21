import { defineCard } from "../define.js";

// EDHREC rank 13859.

export default defineCard({
  name: "Porcuparrot",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird", "Beast"],
  power: 3,
  toughness: 4,
  mutate: "{2}{R}",
  text: "Mutate {2}{R} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\n{T}: This creature deals X damage to any target, where X is the number of times this creature has mutated.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { timesMutated: "source" }, target: 0 },
      resolve: null,
      text: "{T}: This creature deals X damage to any target, where X is the number of times this creature has mutated.",
    },
  ],
});
