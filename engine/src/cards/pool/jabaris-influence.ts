import { defineCard } from "../define.js";

// For good, not until end of turn. "Attacked you" is the player, not a planeswalker
// of theirs (the O-Kagachi, Vengeful Kami ruling). After combat is after the turn's
// first combat phase (rule 506.8d).
export default defineCard({
  name: "Jabari's Influence",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only after combat.\nGain control of target nonartifact, nonblack creature that attacked you this turn and put a -1/-0 counter on it.",
  castOnlyIf: { kind: "turn-structure", afterCombat: true },
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"], attackedYouThisTurn: true },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "add-counter", target: 0, counter: "-1/-0", amount: 1 },
    ],
  },
});
