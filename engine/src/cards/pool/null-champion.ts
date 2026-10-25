import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

export default defineCard({
  name: "Null Champion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Level up {3} ({3}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-3\n4/2\nLEVEL 4+\n7/3\n{B}: Regenerate this creature.",
  activated: [
    levelUp("{3}"),
    {
      cost: { mana: "{B}", tap: false },
      condition: levelBand(4),
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  static: [levelStatic(levelBand(1, 3), 4, 2, "LEVEL 1-3\n4/2"), levelStatic(levelBand(4), 7, 3, "LEVEL 4+\n7/3")],
});
