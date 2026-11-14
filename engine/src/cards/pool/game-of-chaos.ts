import { defineCard } from "../define.js";

// EDHREC rank 7364.
//
// The stakes double with each flip (the ruling: "double the amount of life
// lost or gained"): 1, then 2, 4, … — the `repeat`'s pass. The winner of the
// flip decides whether to flip again: you, or the target opponent when you
// lost, asked about your spell (its passes stay yours).
const TEXT =
  "Flip a coin. If you win the flip, you gain 1 life and target opponent loses 1 life, and you decide whether to flip again. If you lose the flip, you lose 1 life and that opponent gains 1 life, and that player decides whether to flip again. Double the life stakes with each flip.";

const STAKES = { powerOfTwo: { sum: [{ repeatPass: true }, -1] } } as const;

export default defineCard({
  name: "Game of Chaos",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "repeat",
    effect: {
      kind: "flip-coin",
      won: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: STAKES },
          { kind: "lose-life", amount: STAKES, target: 0 },
        ],
      },
      lost: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: STAKES },
          { kind: "gain-life", amount: STAKES, who: { target: 0 } },
        ],
      },
    },
    mayAgain: {
      prompt: "Flip again?",
      asks: [{ if: { kind: "this-way", what: "flips-won" }, who: "you" }, { who: { target: 0 } }],
    },
  },
});
