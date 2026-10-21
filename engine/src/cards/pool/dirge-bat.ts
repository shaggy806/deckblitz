import { defineCard } from "../define.js";

export default defineCard({
  name: "Dirge Bat",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying"],
  mutate: "{4}{B}{B}",
  text: "Mutate {4}{B}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlash\nFlying\nWhenever this creature mutates, destroy target creature or planeswalker an opponent controls.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Whenever this creature mutates, destroy target creature or planeswalker an opponent controls.",
    },
  ],
});
