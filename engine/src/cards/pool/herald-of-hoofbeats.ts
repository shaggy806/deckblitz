import { defineCard } from "../define.js";

// EDHREC rank 5239.

export default defineCard({
  name: "Herald of Hoofbeats",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\nOther Knights you control have horsemanship.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Knight" },
      grantKeywords: ["horsemanship"],
      text: "Other Knights you control have horsemanship.",
    },
  ],
});
