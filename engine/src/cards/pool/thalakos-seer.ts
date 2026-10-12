import { defineCard } from "../define.js";

export default defineCard({
  name: "Thalakos Seer",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nWhen this creature leaves the battlefield, draw a card.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, draw a card.",
    },
  ],
});
