import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, if you control a Teferi planeswalker, draw a card.";

export default defineCard({
  name: "Historian of Zhalfir",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Teferi" }, atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
