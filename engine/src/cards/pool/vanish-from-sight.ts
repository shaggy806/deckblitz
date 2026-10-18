import { defineCard } from "../define.js";

// EDHREC rank 21073.
//
// The permanent's owner picks top or bottom; then you surveil. An illegal
// target means the spell doesn't resolve and there's no surveil (the ruling
// — its only target).

export default defineCard({
  name: "Vanish from Sight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target nonland permanent's owner puts it on their choice of the top or bottom of their library. Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "surveil", amount: 1 },
    ],
  },
});
