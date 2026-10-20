import { defineCard } from "../define.js";

// EDHREC rank 20067.
//
// Two targets — any target, and an opponent — dealt to at once (Char's
// `simultaneous`, Ashling's Command's `controlledByTarget`). If one target
// becomes illegal the other half still happens (rule 608.2b).
const TEXT =
  "Seismic Wave deals 2 damage to any target and 1 damage to each nonartifact creature target opponent controls.";

export default defineCard({
  name: "Seismic Wave",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["any-target", "opponent"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      {
        kind: "damage-all",
        filter: { type: "creature", notTypes: ["artifact"] },
        amount: 1,
        controlledByTarget: 1,
      },
    ],
  },
});
