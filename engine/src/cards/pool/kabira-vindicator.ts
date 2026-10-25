import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 20717.

export default defineCard({
  name: "Kabira Vindicator",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  text: "Level up {2}{W} ({2}{W}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-4\n3/6\nOther creatures you control get +1/+1.\nLEVEL 5+\n4/8\nOther creatures you control get +2/+2.",
  activated: [levelUp("{2}{W}")],
  static: [
    levelStatic(levelBand(2, 4), 3, 6, "LEVEL 2-4\n3/6"),
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: levelBand(2, 4),
      grantPt: [1, 1],
      text: "Other creatures you control get +1/+1.",
    },
    levelStatic(levelBand(5), 4, 8, "LEVEL 5+\n4/8"),
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: levelBand(5),
      grantPt: [2, 2],
      text: "Other creatures you control get +2/+2.",
    },
  ],
});
