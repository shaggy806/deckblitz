import { defineCard } from "../define.js";

// EDHREC rank 17924.
//
// Misleading Motes's owner's choice of top or bottom, then surveil 1 once the
// owner has answered.

export default defineCard({
  name: "Uncharted Voyage",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature's owner puts it on their choice of the top or bottom of their library.\nSurveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "surveil", amount: 1 },
    ],
  },
});
