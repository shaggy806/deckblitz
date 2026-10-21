import { defineCard } from "../define.js";

// Legends. EDHREC rank 21716.

export default defineCard({
  name: "Kobold Overlord",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kobold"],
  power: 1,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nOther Kobold creatures you control have first strike.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Kobold" },
      grantKeywords: ["first-strike"],
      text: "Other Kobold creatures you control have first strike.",
    },
  ],
});
