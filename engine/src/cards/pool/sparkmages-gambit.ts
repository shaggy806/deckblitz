import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Sparkmage's Gambit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sparkmage's Gambit deals 1 damage to each of up to two target creatures. Those creatures can't block this turn.",
  targets: distinctTargets(2, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
        ],
      },
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
    ],
  },
});
