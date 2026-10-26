import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Dauthi Warlord counts creatures with the Shadow ability controlled by all
//     players.

const POWER_TEXT = "Dauthi Warlord's power is equal to the number of creatures on the battlefield with shadow.";

export default defineCard({
  name: "Dauthi Warlord",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Soldier"],
  power: 0,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${POWER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", keyword: "shadow" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
});
