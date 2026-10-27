import { defineCard } from "../define.js";

export default defineCard({
  name: "Skittering Monstrosity",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 5,
  text: "When you cast a creature spell, sacrifice this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you cast a creature spell, sacrifice this creature.",
    },
  ],
});
