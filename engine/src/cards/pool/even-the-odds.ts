import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 27882.
//
// "Cast this spell only if you control fewer creatures than each opponent" is
// read as it's cast (`castOnlyIf`, rule 601.3); the ruling: it doesn't matter
// how many creatures you control as it resolves.

export default defineCard({
  name: "Even the Odds",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only if you control fewer creatures than each opponent.\nCreate three 1/1 white Soldier creature tokens.",
  castOnlyIf: {
    kind: "player-compare",
    stat: { controls: { type: "creature" } },
    compare: "fewer",
    than: "each-opponent",
  },
  effect: { kind: "create-token", token: "Soldier Token", count: 3 },
});
