import { defineCard } from "../define.js";

// EDHREC rank 17798. The creature may be one just milled (the ruling). An
// artifact as it enters, so "whenever an artifact enters" sees one.
export default defineCard({
  name: "Path of the Schemer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player mills two cards. Then you put a creature card from a graveyard onto the battlefield under your control. It's an artifact in addition to its other types.\nWill of the Planeswalkers — Starting with you, each player votes for planeswalk or chaos. If planeswalk gets more votes, planeswalk. If chaos gets more votes or the vote is tied, chaos ensues.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "each-player", amount: 2 },
      {
        kind: "look-and-choose",
        zone: "graveyards",
        min: 1,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
        enterAs: { addTypes: ["artifact"] },
      },
      { kind: "vote", for: { options: ["planeswalk", "chaos"] } },
    ],
  },
});
