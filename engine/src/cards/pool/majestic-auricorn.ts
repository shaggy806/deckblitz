import { defineCard } from "../define.js";

export default defineCard({
  name: "Majestic Auricorn",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  mutate: "{3}{W}",
  text: "Mutate {3}{W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nVigilance\nWhenever this creature mutates, you gain 4 life.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: "Whenever this creature mutates, you gain 4 life.",
    },
  ],
});
