import { defineCard } from "../define.js";

// EDHREC rank 20673.
//
// Arlinn's Wolf's evasion (judged as blockers are declared — a blocker's
// power changing later doesn't unblock it, the ruling), and Fugitive Droid's
// `turn-history` condition on a static, "another" its `excludeSelf`.

const EVADE_TEXT = "This creature can't be blocked by creatures with power 2 or less.";
const PUMP_TEXT =
  "As long as another creature entered the battlefield under your control this turn, this creature gets +2/+0.";

export default defineCard({
  name: "Bristlebane Outrider",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 3,
  toughness: 5,
  text: `${EVADE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: EVADE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, excludeSelf: true },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});
