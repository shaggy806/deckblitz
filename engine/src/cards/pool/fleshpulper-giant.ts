import { defineCard } from "../define.js";

export default defineCard({
  name: "Fleshpulper Giant",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, you may destroy target creature with toughness 2 or less.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "lte", n: 2 } } }],
      effect: {
        kind: "may",
        prompt: "Destroy target creature with toughness 2 or less?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may destroy target creature with toughness 2 or less.",
    },
  ],
});
