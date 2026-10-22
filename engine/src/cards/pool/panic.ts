import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 16662.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, this spell can be cast during any of them
//     as long as it's before the beginning of that phase's Declare Blockers Step.
//
// "During combat before blockers are declared" is the beginning of combat and
// declare attackers steps (Disharmony's timing).

const TIMING_TEXT = "Cast this spell only during combat before blockers are declared.";

export default defineCard({
  name: "Panic",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TIMING_TEXT}\nTarget creature can't block this turn.\nDraw a card at the beginning of the next turn's upkeep.`,
  castOnlyIf: { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
