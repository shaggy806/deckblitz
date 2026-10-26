import { defineCard } from "../define.js";

// EDHREC rank 17237. Goblin Oriflamme's static at +2/+0.

const TEXT = "Attacking creatures you control get +2/+0.";

export default defineCard({
  name: "Nobilis of War",
  manaCost: "{R/W}{R/W}{R/W}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
});
