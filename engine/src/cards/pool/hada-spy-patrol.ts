import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 23587.

export default defineCard({
  name: "Hada Spy Patrol",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Level up {2}{U} ({2}{U}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n2/2\nThis creature can't be blocked.\nLEVEL 3+\n3/3\nShroud (This creature can't be the target of spells or abilities.)\nThis creature can't be blocked.",
  activated: [levelUp("{2}{U}")],
  static: [
    levelStatic(levelBand(1, 2), 2, 2, "LEVEL 1-2\n2/2\nThis creature can't be blocked.", ["unblockable"]),
    levelStatic(
      levelBand(3),
      3,
      3,
      "LEVEL 3+\n3/3\nShroud (This creature can't be the target of spells or abilities.)\nThis creature can't be blocked.",
      ["shroud", "unblockable"],
    ),
  ],
});
