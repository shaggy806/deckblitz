import { defineCard } from "../define.js";

// Battle for Baldur's Gate (CLB). A d20 results table (rule 706.3a). The
// 1—9 row's opponent is chosen as it resolves (not a target), then they
// choose the creature; the 20 row is Crackling Doom's greatest-power edict.

export default defineCard({
  name: "Myrkul's Edict",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Roll a d20.\n1—9 | Choose an opponent. That player sacrifices a creature of their choice.\n10—19 | Each opponent sacrifices a creature of their choice.\n20 | Each opponent sacrifices a creature with the greatest power among creatures that player controls.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      {
        min: 1,
        max: 9,
        effect: {
          kind: "choose-opponent",
          then: { kind: "sacrifice", who: "that-player", filter: { type: "creature" }, count: 1 },
        },
      },
      {
        min: 10,
        max: 19,
        effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      },
      {
        min: 20,
        effect: {
          kind: "sacrifice",
          who: "each-opponent",
          filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
          count: 1,
        },
      },
    ],
  },
});
