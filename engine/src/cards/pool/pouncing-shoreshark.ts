import { defineCard } from "../define.js";

export default defineCard({
  name: "Pouncing Shoreshark",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shark", "Beast"],
  power: 4,
  toughness: 3,
  keywords: ["flash"],
  mutate: "{3}{U}",
  text: "Mutate {3}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlash\nWhenever this creature mutates, you may return target creature an opponent controls to its owner's hand.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Return target creature an opponent controls to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: "Whenever this creature mutates, you may return target creature an opponent controls to its owner's hand.",
    },
  ],
});
