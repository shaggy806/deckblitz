import { defineCard } from "../define.js";

// EDHREC rank 27307. Shadowmoor.

export default defineCard({
  name: "Mudbrawler Cohort",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nThis creature gets +1/+1 as long as you control another red creature.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["R"] }, atLeast: 1, excludeSelf: true },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control another red creature.",
    },
  ],
});
