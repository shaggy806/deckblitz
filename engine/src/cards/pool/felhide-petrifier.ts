import { defineCard } from "../define.js";

export default defineCard({
  name: "Felhide Petrifier",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nOther Minotaur creatures you control have deathtouch.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Minotaur" },
      grantKeywords: ["deathtouch"],
      text: "Other Minotaur creatures you control have deathtouch.",
    },
  ],
});
