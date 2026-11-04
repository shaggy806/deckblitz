import { defineCard } from "../define.js";

// Commandeer's effect over any spell: a creature spell too.
export default defineCard({
  name: "Aethersnatch",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Gain control of target spell. You may choose new targets for it. (If that spell becomes a permanent, it enters under your control.)",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control-spell", target: 0 },
      { kind: "change-targets", target: 0, how: "choose-new" },
    ],
  },
});
