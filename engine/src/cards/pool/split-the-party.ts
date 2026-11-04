import { defineCard } from "../define.js";

// "Choose target player" targets; the creatures don't. The ruling: the spell's
// controller chooses which, as it resolves. Half is read then, each token of a
// stack counted, and "their owner's hand" is each creature's own.
const TEXT = "Choose target player. Return half the creatures they control to their owner's hand, rounded up.";

const HALF = {
  half: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 },
  round: "up",
} as const;

export default defineCard({
  name: "Split the Party",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "choose-permanents",
    filter: { type: "creature" },
    controlledByPlayer: { target: 0 },
    min: HALF,
    upTo: HALF,
    then: { kind: "return-to-hand", target: 0 },
    prompt: "Return half the creatures they control to their owner's hand, rounded up",
  },
});
