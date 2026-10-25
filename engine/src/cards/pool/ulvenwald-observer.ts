import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control with toughness 4 or greater dies, draw a card.";

export default defineCard({
  name: "Ulvenwald Observer",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", toughness: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
