import { defineCard } from "../define.js";

export default defineCard({
  name: "Woodlot Crawler",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  keywords: ["forestwalk"],
  text: "Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\nProtection from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["G"] },
      text: "Protection from green",
    },
  ],
});
