import { defineCard } from "../define.js";

// EDHREC rank 17063. The Brothers' War.
// Rulings:
//   You will add {C}{C}{C} instead of {C} if you control at least one creature named Mine Worker
//   and at least one creature named Power Plant Worker.

const MANA_TEXT =
  "{T}: Add {C}. If you control creatures named Mine Worker and Power Plant Worker, add {C}{C}{C} instead.";

export default defineCard({
  name: "Tower Worker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      // Urza's Tower's shape, over creature names.
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: {
          ifCondition: {
            kind: "all",
            of: [
              { kind: "controls", filter: { type: "creature", name: "Mine Worker" }, atLeast: 1 },
              { kind: "controls", filter: { type: "creature", name: "Power Plant Worker" }, atLeast: 1 },
            ],
          },
          then: 3,
          else: 1,
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
