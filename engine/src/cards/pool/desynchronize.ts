import { defineCard } from "../define.js";

// EDHREC rank 24560.

export default defineCard({
  name: "Desynchronize",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target nonland permanent's owner puts it on their choice of the top or bottom of their library. Scry 2.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "scry", amount: 2 },
    ],
  },
});
