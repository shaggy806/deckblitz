import { defineCard } from "../define.js";

// EDHREC rank 19408.
//
// Whether you control both artifacts is read as the ability resolves, and a
// named card that's stopped being an artifact doesn't count (the rulings).
const TEXT =
  "{T}: This artifact deals 1 damage to target player or planeswalker. It deals 3 damage instead if you control artifacts named Crown of Empires and Throne of Empires.";

export default defineCard({
  name: "Scepter of Empires",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "damage",
        target: 0,
        amount: {
          ifCondition: {
            kind: "all",
            of: [
              { kind: "controls", filter: { type: "artifact", name: "Crown of Empires" }, atLeast: 1 },
              { kind: "controls", filter: { type: "artifact", name: "Throne of Empires" }, atLeast: 1 },
            ],
          },
          then: 3,
          else: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
