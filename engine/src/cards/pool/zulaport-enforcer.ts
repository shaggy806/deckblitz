import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 25285. "Can't be blocked except by black creatures" is can't be
// blocked by nonblack ones (Vine Mare's shape, inverted).

export default defineCard({
  name: "Zulaport Enforcer",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Level up {4} ({4}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n3/3\nLEVEL 3+\n5/5\nThis creature can't be blocked except by black creatures.",
  activated: [levelUp("{4}")],
  static: [
    levelStatic(levelBand(1, 2), 3, 3, "LEVEL 1-2\n3/3"),
    levelStatic(levelBand(3), 5, 5, "LEVEL 3+\n5/5"),
    {
      affects: { scope: "self" },
      condition: levelBand(3),
      cantBeBlockedBy: { notColors: ["B"] },
      text: "This creature can't be blocked except by black creatures.",
    },
  ],
});
