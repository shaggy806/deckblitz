import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

export default defineCard({
  name: "Hexdrinker",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 1,
  text: "Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 3-7\n4/4\nProtection from instants\nLEVEL 8+\n6/6\nProtection from everything",
  activated: [levelUp("{1}")],
  static: [
    levelStatic(levelBand(3, 7), 4, 4, "LEVEL 3-7\n4/4"),
    {
      affects: { scope: "self" },
      condition: levelBand(3, 7),
      protection: { types: ["instant"] },
      text: "Protection from instants",
    },
    levelStatic(levelBand(8), 6, 6, "LEVEL 8+\n6/6"),
    {
      // Progenitus's "protection from everything".
      affects: { scope: "self" },
      condition: levelBand(8),
      protection: { filter: {} },
      text: "Protection from everything",
    },
  ],
});
