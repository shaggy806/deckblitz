import { defineCard } from "../define.js";

// EDHREC rank 26796.
//
// The creature's owner chooses top or bottom (the ruling) — whoever controls
// it now.

export default defineCard({
  name: "Misleading Motes",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature's owner puts it on their choice of the top or bottom of their library.",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
