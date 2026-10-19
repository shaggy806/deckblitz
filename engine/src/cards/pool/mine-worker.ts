import { defineCard } from "../define.js";

// EDHREC rank 18861. The Brothers' War.
// Rulings:
//   You will gain 3 life instead of 1 if, at the time the ability resolves, you control at least
//   one creature named Power Plant Worker and at least one creature named Tower Worker.

const LIFE_TEXT =
  "{T}: You gain 1 life. If you control creatures named Power Plant Worker and Tower Worker, you gain 3 life instead.";

export default defineCard({
  name: "Mine Worker",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 2,
  toughness: 1,
  text: LIFE_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      // Read as the ability resolves (the ruling).
      effect: {
        kind: "gain-life",
        amount: {
          ifCondition: {
            kind: "all",
            of: [
              { kind: "controls", filter: { type: "creature", name: "Power Plant Worker" }, atLeast: 1 },
              { kind: "controls", filter: { type: "creature", name: "Tower Worker" }, atLeast: 1 },
            ],
          },
          then: 3,
          else: 1,
        },
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
