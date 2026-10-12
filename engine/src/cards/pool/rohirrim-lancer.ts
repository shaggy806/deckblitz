import { defineCard } from "../define.js";

export default defineCard({
  name: "Rohirrim Lancer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature dies, the Ring tempts you.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this creature dies, the Ring tempts you.",
    },
  ],
});
