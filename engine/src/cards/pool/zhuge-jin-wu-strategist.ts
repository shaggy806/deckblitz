import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 27533.
//
// Rulings:
//   If a turn has multiple combat phases, the ability can only be activated before the beginning
//   of the declare attackers step of the first combat phase in that turn.

const TEXT = "{T}: Target creature can't be blocked this turn. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Zhuge Jin, Wu Strategist",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
