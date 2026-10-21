import { defineCard } from "../define.js";

// EDHREC rank 16458.
//
// Rulings:
//   [2019-10-04] If Syr Faren leaves the battlefield before its triggered ability resolves, use
//     its power as it last existed on the battlefield to determine the value of X.
//   [2019-10-04] The value of X is determined only as Syr Faren's triggered ability resolves.
//   [2019-10-04] If Syr Faren's power is negative as its triggered ability resolves, X is
//     considered to be 0.
//
// Wildwood Mentor's shape: `powerOf` reads the source's last-known power and
// a P/T change through it never goes below 0 (rule 107.1b).

const TEXT =
  "Whenever Syr Faren attacks, another target attacking creature gets +X/+X until end of turn, where X is Syr Faren's power.";

export default defineCard({
  name: "Syr Faren, the Hengehammer",
  manaCost: "{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
