import { defineCard } from "../define.js";

// The Brothers' War. Any permanent you sacrificed this turn counts, whether
// or not this creature was on the battlefield then (the ruling) — the turn
// history is the player's.
const STATIC_TEXT = "This creature gets +2/+0 and has menace as long as you sacrificed a permanent this turn.";

export default defineCard({
  name: "Goblin Blast-Runner",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 2,
  text: STATIC_TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you" },
      grantPt: [2, 0],
      grantKeywords: ["menace"],
      text: STATIC_TEXT,
    },
  ],
});
