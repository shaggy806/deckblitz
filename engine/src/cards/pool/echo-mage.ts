import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

const ONCE = "{U}{U}, {T}: Copy target instant or sorcery spell. You may choose new targets for the copy.";
const TWICE = "{U}{U}, {T}: Copy target instant or sorcery spell twice. You may choose new targets for the copies.";

// Rulings: any instant or sorcery spell, whoever controls it; each copy may get
// new targets independently.
export default defineCard({
  name: "Echo Mage",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `Level up {1}{U} ({1}{U}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-3\n2/4\n${ONCE}\nLEVEL 4+\n2/5\n${TWICE}`,
  activated: [
    levelUp("{1}{U}"),
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      condition: levelBand(2, 3),
      text: ONCE,
    },
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "copy-spell", target: 0, newTargets: true, count: 2 },
      resolve: null,
      condition: levelBand(4),
      text: TWICE,
    },
  ],
  static: [levelStatic(levelBand(2, 3), 2, 4, "LEVEL 2-3\n2/4"), levelStatic(levelBand(4), 2, 5, "LEVEL 4+\n2/5")],
});
