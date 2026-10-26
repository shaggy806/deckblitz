import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 29776.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

const TEXT = "{T}: Destroy target tapped creature. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Steam Catapult",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
