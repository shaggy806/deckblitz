import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 18382.

export default defineCard({
  name: "Student of Warfare",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: "Level up {W} ({W}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-6\n3/3\nFirst strike\nLEVEL 7+\n4/4\nDouble strike",
  activated: [levelUp("{W}")],
  static: [
    levelStatic(levelBand(2, 6), 3, 3, "LEVEL 2-6\n3/3\nFirst strike", ["first-strike"]),
    levelStatic(levelBand(7), 4, 4, "LEVEL 7+\n4/4\nDouble strike", ["double-strike"]),
  ],
});
