import { defineCard } from "../define.js";

// EDHREC rank 31851. Thraben Doomsayer's fateful hour, granting vigilance.

const FATEFUL = "Fateful hour — As long as you have 5 or less life, other creatures you control have vigilance.";

export default defineCard({
  name: "Village Survivors",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${FATEFUL}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      grantKeywords: ["vigilance"],
      text: FATEFUL,
    },
  ],
});
