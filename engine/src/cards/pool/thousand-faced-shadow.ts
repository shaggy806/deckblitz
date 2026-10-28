import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 2691. "Enters from your hand, if it's attacking" is an
// intervening if (rule 603.4) on the source's entry record (`enteredFrom`) —
// ninjutsu's entry, not a cast's (that one comes from the stack). The token
// is Flamerush Rider's: tapped and attacking whom its controller chooses (the
// ruling), never declared as an attacker.
//
// Rulings:
//   [2022-02-18] Although the token is attacking, it was never declared as an attacking creature.
//   [2022-02-18] You choose which opponent or opposing planeswalker the token is attacking as you
//     put it onto the battlefield. It doesn't have to be the same player or planeswalker
//     Thousand-Faced Shadow is attacking.
//   [2022-02-18] If the copied creature had {X} in its mana cost, X is 0.

const ENTER_TEXT =
  "When this creature enters from your hand, if it's attacking, create a token that's a copy of another target attacking creature. The token enters tapped and attacking.";

export default defineCard({
  name: "Thousand-Faced Shadow",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `${ninjutsuText("{2}{U}{U}")}\nFlying\n${ENTER_TEXT}`,
  activated: [ninjutsu("{2}{U}{U}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { enteredFrom: "hand", attacking: true } },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        tapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
