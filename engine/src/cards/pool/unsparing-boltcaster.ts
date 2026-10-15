import { defineCard } from "../define.js";

// EDHREC rank 24120.
//
// "That was dealt damage this turn": by any source (`damagedThisTurnBy` with
// no clause — Sold Out's shape).

const ENTER_TEXT =
  "When this creature enters, it deals 5 damage to target creature an opponent controls that was dealt damage this turn.";

export default defineCard({
  name: "Unsparing Boltcaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Wizard"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
