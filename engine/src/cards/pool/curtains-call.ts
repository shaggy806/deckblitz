import { defineCard } from "../define.js";

// EDHREC rank 3585.
//
// Rulings:
//   [2016-11-08] You can't cast Curtains' Call without two creatures to target. If one becomes an
//     illegal target after you've cast Curtains' Call, the other will still be destroyed.
//   [2016-11-08] Causing an opponent to lose the game after you've announced that you're casting a
//     spell with undaunted and determined its total cost won't cause you to have to pay more mana.
//   [2016-11-08] Effects that reduce what you pay to cast a spell don't affect its mana value.

export default defineCard({
  name: "Curtains' Call",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { opponents: true },
  },
  text: "Undaunted (This spell costs {1} less to cast for each opponent.)\nDestroy two target creatures.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
