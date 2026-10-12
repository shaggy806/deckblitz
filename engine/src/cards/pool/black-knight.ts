import { defineCard } from "../define.js";

export default defineCard({
  name: "Black Knight",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike (This creature deals combat damage before creatures without first strike.)\nProtection from white (This creature can't be blocked, targeted, dealt damage, or enchanted by anything white.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
