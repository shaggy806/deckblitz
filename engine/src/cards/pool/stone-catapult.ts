import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 30582.
//
// Rulings:
//   If a turn has multiple combat phases, the ability can only be activated before the beginning
//   of the declare attackers step of the first combat phase in that turn.

const TEXT = "{T}: Destroy target tapped nonblack creature. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Stone Catapult",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true, notColors: ["B"] } }],
      effect: { kind: "destroy", target: 0 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
