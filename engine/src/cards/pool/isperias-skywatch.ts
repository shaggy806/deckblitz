import { defineCard } from "../define.js";

export default defineCard({
  name: "Isperia's Skywatch",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "detain", target: 0 },
      resolve: null,
      text: "When this creature enters, detain target creature an opponent controls.",
    },
  ],
});
