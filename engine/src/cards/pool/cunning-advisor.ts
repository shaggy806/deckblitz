import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 27493.
//
// Rulings:
//   If a turn has multiple combat phases, the ability can only be activated before the beginning
//   of the declare attackers step of the first combat phase in that turn.

const TEXT = "{T}: Target opponent discards a card. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Cunning Advisor",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 1 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
