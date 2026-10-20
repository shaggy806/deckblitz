import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you gain life equal to the greatest toughness among other creatures you control.";

export default defineCard({
  name: "Flourishing Hunter",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf", "Spirit"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: {
          aggregate: "max",
          of: "toughness",
          filter: { type: "creature", controlledBy: "you" },
          excludeSelf: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
