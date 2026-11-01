import { defineCard } from "../define.js";

// Any creature you control: one already face up just deals the damage. Its
// power is read after it's turned up.

export default defineCard({
  name: "Showstopping Surprise",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose target creature you control. Turn it face up if it's face down. Then it deals damage equal to its power to each other creature.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "turn-face-up", target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: { powerOf: 0 }, exceptSource: true, from: { target: 0 } },
    ],
  },
});
