import { defineCard } from "../define.js";

// EDHREC rank 22577.
//
// Sink into Stupor's `spell-or-permanent` slot, without its "an opponent
// controls"; Misleading Motes's owner's choice of top or bottom. A spell put
// there leaves the stack without being countered; a copy of a spell ceases
// to exist instead (rule 707.10a).

export default defineCard({
  name: "Sudden Setback",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "The owner of target spell or nonland permanent puts it on their choice of the top or bottom of their library.",
  targets: [{ kind: "spell-or-permanent", filter: { notTypes: ["land"] } }],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
