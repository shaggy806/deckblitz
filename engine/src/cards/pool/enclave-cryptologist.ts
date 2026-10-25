import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

const LOOT = "{T}: Draw a card, then discard a card.";
const DRAW = "{T}: Draw a card.";

export default defineCard({
  name: "Enclave Cryptologist",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 0,
  toughness: 1,
  text: `Level up {1}{U} ({1}{U}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n0/1\n${LOOT}\nLEVEL 3+\n0/1\n${DRAW}`,
  activated: [
    levelUp("{1}{U}"),
    {
      cost: { mana: null, tap: true },
      condition: levelBand(1, 2),
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
    {
      cost: { mana: null, tap: true },
      condition: levelBand(3),
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  static: [
    levelStatic(levelBand(1, 2), 0, 1, `LEVEL 1-2\n0/1\n${LOOT}`),
    levelStatic(levelBand(3), 0, 1, `LEVEL 3+\n0/1\n${DRAW}`),
  ],
});
