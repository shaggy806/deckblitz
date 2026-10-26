import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// Portal Second Age (P02). EDHREC rank 29553.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

const TEXT =
  "{T}: Target creature gets +2/+2 until end of turn. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Alaborn Veteran",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      condition: BEFORE_ATTACKERS_DECLARED,
      text: TEXT,
    },
  ],
});
