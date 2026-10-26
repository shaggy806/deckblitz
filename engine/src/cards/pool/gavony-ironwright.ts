import { defineCard } from "../define.js";

// EDHREC rank 30712. Thraben Doomsayer's fateful hour static.

const TEXT = "Fateful hour — As long as you have 5 or less life, other creatures you control get +1/+4.";

export default defineCard({
  name: "Gavony Ironwright",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      grantPt: [1, 4],
      text: TEXT,
    },
  ],
});
