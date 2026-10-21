import { defineCard } from "../define.js";

// EDHREC rank 20651.
//
// Sudden Setback's spell-or-permanent slot and owner's choice of top or
// bottom, narrowed to red or green. A spell put there leaves the stack
// without being countered (the ruling).

export default defineCard({
  name: "Aether Gust",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose target spell or permanent that's red or green. Its owner puts it on their choice of the top or bottom of their library.",
  targets: [{ kind: "spell-or-permanent", filter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
