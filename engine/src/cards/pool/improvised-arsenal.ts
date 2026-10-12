import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9162.
//
// The pump is Cranial Plating's `grantPtPerCount` (the Arsenal counts
// itself). The copy is Pack Rat's `create-token-copy` of the source: its
// copiable values only — not tapped, counters or other effects — read as it
// last existed if it has left the battlefield by then (the rulings), and the
// token has the same ability.
const PUMP = "Equipped creature gets +1/+0 for each artifact you control.";
const COPY = "{4}{R}: Create a token that's a copy of this Equipment.";

export default defineCard({
  name: "Improvised Arsenal",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${COPY}\nEquip {R}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: PUMP,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: COPY,
    },
    equip("{R}"),
  ],
});
