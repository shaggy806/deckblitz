import { defineCard } from "../define.js";

export default defineCard({
  name: "Bala Ged Scorpion",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Scorpion"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, you may destroy target creature with power 1 or less.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 1 } } }],
      effect: {
        kind: "may",
        prompt: "Destroy target creature with power 1 or less?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may destroy target creature with power 1 or less.",
    },
  ],
});
