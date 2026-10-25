import { defineCard } from "../define.js";

const TEXT = "When this creature dies, each player mills three cards.";

export default defineCard({
  name: "Returned Reveler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Satyr"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
