import { defineCard } from "../define.js";

// EDHREC rank 10942. March of the Machine Commander.
//
// Will of the Planeswalkers is a vote (rule 701.38), Path of the Pyromancer's
// shape. Only the planar controller of a Planechase game can planeswalk (rule
// 701.31a), and "chaos ensues" triggers only a plane's chaos ability (311.7),
// so outside Planechase — every game this engine runs — neither result does
// anything; the vote itself still happens.

export default defineCard({
  name: "Path of the Animist",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.\nWill of the Planeswalkers — Starting with you, each player votes for planeswalk or chaos. If planeswalk gets more votes, planeswalk. If chaos gets more votes or the vote is tied, chaos ensues.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 2,
      },
      { kind: "vote", for: { options: ["planeswalk", "chaos"] } },
    ],
  },
});
