import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 24520.

export default defineCard({
  name: "Wrap in Flames",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Wrap in Flames deals 1 damage to each of up to three target creatures. Those creatures can't block this turn.",
  targets: distinctTargets(3, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
          { kind: "damage", amount: 1, target: 2 },
        ],
      },
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
    ],
  },
});
