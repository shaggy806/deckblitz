import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 16232. Aleatory's timing and flip, with the draw now
// rather than at the next upkeep. "During combat after blockers are declared" is the
// declare blockers, combat damage and end of combat steps.

const TIMING_TEXT = "Cast this spell only during combat after blockers are declared.";

export default defineCard({
  name: "Chaotic Strike",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TIMING_TEXT}\nFlip a coin. If you win the flip, target creature gets +1/+1 until end of turn.\nDraw a card.`,
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flip-coin",
        won: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
