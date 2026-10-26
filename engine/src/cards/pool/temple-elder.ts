import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 31768.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

const TEXT = "{T}: You gain 1 life. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Temple Elder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: BEFORE_ATTACKERS_DECLARED,
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
