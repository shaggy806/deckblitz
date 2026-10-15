import { defineCard } from "../define.js";

// EDHREC rank 12003.
//
// Rulings:
//   [2025-06-13] The legendary creature must already be on the battlefield as the land enters the
//     battlefield. If it enters the battlefield at the same time, the land will enter tapped.
//
// - Barad-dûr's `tappedUnless`.
// - The mana ability's rider is Yuna, Grand Summoner's: `add-mana` with an
//   `also` delayed trigger on the next Bird creature spell this turn, which
//   enters with the counter (`enters-with-counters`). Each activation makes
//   its own delayed trigger.
// - The token is Chocobo Racetrack's "Chocobo Bird Token".
const TAPPED_TEXT = "This land enters tapped unless you control a legendary creature.";
const MANA_TEXT =
  "{T}: Add {G}. When you next cast a Bird creature spell this turn, it enters with an additional +1/+1 counter on it.";
const TOKEN_TEXT =
  '{2}{G}{G}, {T}: Create a 2/2 green Bird creature token with "Whenever a land you control enters, this token gets +1/+0 until end of turn."';

export default defineCard({
  name: "Chocobo Camp",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${MANA_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 },
      },
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 1,
        also: {
          kind: "delayed-trigger",
          at: { nextSpell: { type: "creature", subtype: "Bird" } },
          effect: { kind: "enters-with-counters", target: "trigger-object", counter: "+1/+1", amount: 1 },
          text: "That creature enters with an additional +1/+1 counter on it.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{G}{G}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Chocobo Bird Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
