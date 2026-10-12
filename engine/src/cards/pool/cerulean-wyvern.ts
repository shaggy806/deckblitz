import { defineCard } from "../define.js";

export default defineCard({
  name: "Cerulean Wyvern",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, protection from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
