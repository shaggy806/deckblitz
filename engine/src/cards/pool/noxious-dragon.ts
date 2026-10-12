import { defineCard } from "../define.js";

export default defineCard({
  name: "Noxious Dragon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, you may destroy target creature with mana value 3 or less.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: {
        kind: "may",
        prompt: "Destroy target creature with mana value 3 or less?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "When this creature dies, you may destroy target creature with mana value 3 or less.",
    },
  ],
});
