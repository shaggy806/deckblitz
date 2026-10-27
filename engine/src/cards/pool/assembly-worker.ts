import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 27578.
//
// Rulings:
//   [2018-03-16] Assembly-Worker's ability can target any creature with the Assembly-Worker
//     subtype, not only creatures named Assembly-Worker.

const PUMP_TEXT = "{T}: Target Assembly-Worker creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Assembly-Worker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 2,
  toughness: 2,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Assembly-Worker" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
