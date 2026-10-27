import { defineCard } from "../define.js";

// EDHREC rank 18077.
//
// Rulings:
//   It gives +2/+2 to creatures that are both Birds and Soldiers.
//
// Two statics, so a Bird Soldier gets both bonuses; each reaches every other
// creature of its type, whoever controls it.

const BIRDS = "Other Bird creatures get +1/+1.";
const SOLDIERS = "Other Soldier creatures get +1/+1.";

export default defineCard({
  name: "Aven Brigadier",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${BIRDS}\n${SOLDIERS}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Bird" }, excludeSelf: true },
      grantPt: [1, 1],
      text: BIRDS,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Soldier" }, excludeSelf: true },
      grantPt: [1, 1],
      text: SOLDIERS,
    },
  ],
});
