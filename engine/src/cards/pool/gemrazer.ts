import { defineCard } from "../define.js";

export default defineCard({
  name: "Gemrazer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["reach", "trample"],
  mutate: "{1}{G}{G}",
  text: "Mutate {1}{G}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nReach, trample\nWhenever this creature mutates, destroy target artifact or enchantment an opponent controls.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "enchantment"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Whenever this creature mutates, destroy target artifact or enchantment an opponent controls.",
    },
  ],
});
