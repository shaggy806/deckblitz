import { defineCard } from "../define.js";

// New targets are chosen only after the flip is won (its ruling).
export default defineCard({
  name: "Invert Polarity",
  manaCost: "{U}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Choose target spell, then flip a coin. If you win the flip, gain control of that spell and you may choose new targets for it. If you lose the flip, counter that spell.",
  targets: ["spell"],
  effect: {
    kind: "flip-coin",
    won: {
      kind: "sequence",
      effects: [
        { kind: "gain-control-spell", target: 0 },
        { kind: "change-targets", target: 0, how: "choose-new" },
      ],
    },
    lost: { kind: "counter", target: 0 },
  },
});
