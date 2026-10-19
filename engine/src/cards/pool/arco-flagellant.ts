import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// EDHREC rank 14904.
//
// Rulings:
//   [2022-10-07] You may pay the squad cost any number of times. You will get a token that is a
//     copy of that permanent for each time you paid the squad cost.
//   [2022-10-07] The tokens created by the squad ability aren't "cast," so any abilities that
//     trigger when a spell is cast won't trigger for the copies.
//   [2022-10-07] If the spell is countered, the squad ability will not trigger, and no tokens will
//     be created.
//
// The squad tokens are copies of the creature (`squadTrigger`), so they need
// no token definition of their own.

const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const BLOCK_TEXT = "This creature can't block.";
const ENDURANT_TEXT = "Endurant — Pay 3 life: This creature gains indestructible until end of turn.";

export default defineCard({
  name: "Arco-Flagellant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 3,
  toughness: 1,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${BLOCK_TEXT}\n${ENDURANT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 3 },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: ENDURANT_TEXT,
    },
  ],
  triggered: [squadTrigger()],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: BLOCK_TEXT }],
});
