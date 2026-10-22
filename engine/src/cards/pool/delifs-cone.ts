import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 13769.
//
// Rulings:
//   If you use the ability after blockers are declared, it won't trigger at all. So you want to
//     use it before blockers are declared.
//   This card has an activated ability that creates a triggered ability which watches the target
//     creature.
//
// A delayed trigger watching the target (`attacksUnblocked`), for the turn:
// with a stated duration it fires in each combat this turn (rule 603.7c).

const TEXT =
  "{T}, Sacrifice this artifact: This turn, when target creature you control attacks and isn't blocked, you may gain life equal to its power. If you do, it assigns no combat damage this turn.";

export default defineCard({
  name: "Delif's Cone",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "delayed-trigger",
        at: { attacksUnblocked: 0 },
        effect: {
          kind: "may",
          prompt: "Gain life equal to its power? It then assigns no combat damage.",
          effect: { kind: "gain-life", amount: { powerOf: "trigger-object" } },
          then: { kind: "assigns-no-combat-damage", target: "trigger-object" },
        },
        text: "You may gain life equal to its power. If you do, it assigns no combat damage this turn.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
