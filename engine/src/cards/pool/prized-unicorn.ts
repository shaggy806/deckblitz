import { defineCard } from "../define.js";

export default defineCard({
  name: "Prized Unicorn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: "All creatures able to block this creature do so.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
