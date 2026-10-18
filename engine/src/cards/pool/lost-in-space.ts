import { defineCard } from "../define.js";

// EDHREC rank 22146.
//
// Misleading Motes's owner's choice of top or bottom, then surveil 1 once the
// owner has answered. An illegal target means the spell doesn't resolve, and
// there's no surveil (the ruling).

export default defineCard({
  name: "Lost in Space",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target artifact or creature's owner puts it on their choice of the top or bottom of their library. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "surveil", amount: 1 },
    ],
  },
});
