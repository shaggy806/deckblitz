import { defineCard } from "../define.js";

// EDHREC rank 21084.
//
// The permanent's owner — not its controller — picks top or bottom as this
// resolves (Misleading Motes' shape).

export default defineCard({
  name: "Trip Up",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Target nonland permanent's owner puts it on their choice of the top or bottom of their library.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
});
