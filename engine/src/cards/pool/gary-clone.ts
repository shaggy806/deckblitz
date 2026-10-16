import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// EDHREC rank 13243.
//
// Rulings:
//   [2024-03-08] You may pay the squad cost any number of times. You will create a token that is a
//     copy of that permanent for each time you paid the squad cost. If you paid the squad cost
//     multiple times, the tokens will all enter the battlefield simultaneously.
//   [2024-03-08] If the spell resolves but the creature with squad leaves the battlefield before
//     its squad ability resolves, you'll still create the token copies.
//
// Powder Ganger's squad. The token copies are named Gary Clone too, and each
// has the attack trigger: every attacking Gary pumps every Gary you control,
// itself included.

const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const ATTACK_TEXT = "Whenever this creature attacks, each creature you control named Gary Clone gets +1/+0 until end of turn.";

export default defineCard({
  name: "Gary Clone",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 3,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", name: "Gary Clone" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
