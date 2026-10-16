import { defineCard } from "../define.js";

// EDHREC rank 8920.
//
// Spree (rule 702.172a): each chosen mode's cost on top, modes resolved in
// printed order. "Creatures target player controls" is Requisition Raid's
// `controlledByTarget`.
const UNTAP = "+ {1} — Untap all creatures target player controls.";
const DOUBLE = "+ {1} — Target creature gains double strike until end of turn.";

export default defineCard({
  name: "Rustler Rampage",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Spree (Choose one or more additional costs.)\n${UNTAP}\n${DOUBLE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: UNTAP,
        spreeCost: "{1}",
        targets: ["player"],
        effect: {
          kind: "untap-all",
          filter: { type: "creature", controlledBy: "you" },
          controlledByTarget: 0,
        },
      },
      {
        text: DOUBLE,
        spreeCost: "{1}",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      },
    ],
  },
});
