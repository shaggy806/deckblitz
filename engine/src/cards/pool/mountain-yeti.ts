import { defineCard } from "../define.js";

export default defineCard({
  name: "Mountain Yeti",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Yeti"],
  power: 3,
  toughness: 3,
  keywords: ["mountainwalk"],
  text: "Mountainwalk (This creature can't be blocked as long as defending player controls a Mountain.)\nProtection from white",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
