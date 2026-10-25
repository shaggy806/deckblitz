import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 19258.
//
// Rulings:
//   You pick the target on announcement and flip the coin on resolution.
//   If a turn has multiple combat phases, this spell can be cast during any of them as long as
//     it's after the beginning of that phase's Declare Blockers Step.
//
// "During combat after blockers are declared" is the declare blockers, combat
// damage and end of combat steps (Panic's timing, the other way round). The
// draw is set up whatever the flip.

const TIMING_TEXT = "Cast this spell only during combat after blockers are declared.";

export default defineCard({
  name: "Aleatory",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TIMING_TEXT}\nFlip a coin. If you win the flip, target creature gets +1/+1 until end of turn.\nDraw a card at the beginning of the next turn's upkeep.`,
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flip-coin",
        won: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  },
});
