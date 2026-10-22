import { defineCard } from "../define.js";

// EDHREC rank 13752.
//
// Chrome Dome's shape, on any target artifact and exiled rather than
// sacrificed: "That token gains haste" is an effect on the token, not a copy
// exception.
//
// Rulings:
//   [2017-02-09] If the copied artifact has {X} in its mana cost, X is considered to be 0.
//   [2017-02-09] The token copies exactly what was printed on the original artifact and nothing
//     else (unless that artifact is copying something else or is a token).
//   [2017-02-09] Any enters-the-battlefield abilities of the copied artifact will trigger when the
//     token enters the battlefield.

const COPY_TEXT =
  "{7}: Create a token that's a copy of target artifact. That token gains haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Cogwork Assembler",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 2,
  toughness: 3,
  text: COPY_TEXT,
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: ["artifact"],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        gains: { keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
