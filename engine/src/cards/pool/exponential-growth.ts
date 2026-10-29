import { defineCard } from "../define.js";

// EDHREC rank 6756.
// One doubling after another, each reading the power as it is then (the rulings): a negative power
// doubles further down.

export default defineCard({
  name: "Exponential Growth",
  manaCost: "{X}{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, double target creature's power X times.",
  targets: ["creature"],
  effect: {
    kind: "repeat",
    times: "x",
    effect: {
      kind: "modify-pt",
      target: 0,
      power: { powerOf: 0, doubling: true },
      toughness: 0,
      duration: "end-of-turn",
    },
  },
});
