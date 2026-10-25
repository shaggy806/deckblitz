import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

export default defineCard({
  name: "Halimar Wavewatch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 0,
  toughness: 3,
  text: "Level up {2} ({2}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-4\n0/6\nLEVEL 5+\n6/6\nIslandwalk (This creature can't be blocked as long as defending player controls an Island.)",
  activated: [levelUp("{2}")],
  static: [
    levelStatic(levelBand(1, 4), 0, 6, "LEVEL 1-4\n0/6"),
    levelStatic(levelBand(5), 6, 6, "LEVEL 5+\n6/6\nIslandwalk", ["islandwalk"]),
  ],
});
