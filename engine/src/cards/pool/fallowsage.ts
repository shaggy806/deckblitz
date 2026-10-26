import { defineCard } from "../define.js";

export default defineCard({
  name: "Fallowsage",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes tapped, you may draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever this creature becomes tapped, you may draw a card.",
    },
  ],
});
