import { defineCard } from "../define.js";

export default defineCard({
  name: "Sphinx of the Steel Wind",
  manaCost: "{5}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "first-strike", "vigilance", "lifelink"],
  text: "Flying, first strike, vigilance, lifelink, protection from red and from green",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["R", "G"] },
      text: "Protection from red and from green",
    },
  ],
});
