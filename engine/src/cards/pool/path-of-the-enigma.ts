import { defineCard } from "../define.js";

// EDHREC rank 19602.
//
// Will of the Planeswalkers is a vote (rule 701.38), Path of the Pyromancer's
// shape. Only the planar controller of a Planechase game can planeswalk (rule
// 701.31a), and "chaos ensues" triggers only a plane's chaos ability (311.7),
// so outside Planechase — every game this engine runs — neither result does
// anything; the vote itself still happens.

export default defineCard({
  name: "Path of the Enigma",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player draws four cards.\nWill of the Planeswalkers — Starting with you, each player votes for planeswalk or chaos. If planeswalk gets more votes, planeswalk. If chaos gets more votes or the vote is tied, chaos ensues.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4, target: 0 },
      { kind: "vote", for: { options: ["planeswalk", "chaos"] } },
    ],
  },
});
