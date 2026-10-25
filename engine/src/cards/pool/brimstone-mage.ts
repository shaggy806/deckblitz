import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

const LOW = "{T}: This creature deals 1 damage to any target.";
const HIGH = "{T}: This creature deals 3 damage to any target.";

export default defineCard({
  name: "Brimstone Mage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `Level up {3}{R} ({3}{R}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n2/3\n${LOW}\nLEVEL 3+\n2/4\n${HIGH}`,
  activated: [
    levelUp("{3}{R}"),
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      condition: levelBand(1, 2),
      text: LOW,
    },
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      condition: levelBand(3),
      text: HIGH,
    },
  ],
  static: [levelStatic(levelBand(1, 2), 2, 3, "LEVEL 1-2\n2/3"), levelStatic(levelBand(3), 2, 4, "LEVEL 3+\n2/4")],
});
