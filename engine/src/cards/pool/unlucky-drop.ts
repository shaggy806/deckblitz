import { defineCard } from "../define.js";

// EDHREC rank 26396.
//
// The permanent's owner chooses top or bottom (the ruling) — Misleading
// Motes' shape.

export default defineCard({
  name: "Unlucky Drop",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target artifact or creature's owner puts it on their choice of the top or bottom of their library.",
  targets: ["artifact-or-creature"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
