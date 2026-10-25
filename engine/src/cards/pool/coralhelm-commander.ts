import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 11196.

export default defineCard({
  name: "Coralhelm Commander",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-3\n3/3\nFlying\nLEVEL 4+\n4/4\nFlying\nOther Merfolk creatures you control get +1/+1.",
  activated: [levelUp("{1}")],
  static: [
    levelStatic(levelBand(2, 3), 3, 3, "LEVEL 2-3\n3/3\nFlying", ["flying"]),
    levelStatic(levelBand(4), 4, 4, "LEVEL 4+\n4/4\nFlying", ["flying"]),
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Merfolk" },
      condition: levelBand(4),
      grantPt: [1, 1],
      text: "Other Merfolk creatures you control get +1/+1.",
    },
  ],
});
