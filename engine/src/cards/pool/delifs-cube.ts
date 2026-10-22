import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 28084.
//
// Rulings:
//   If you use the ability after blockers are declared, it won't trigger at all. So you want to
//     use it before blockers are declared.
//   This card has an activated ability that creates a triggered ability which watches the target
//     creature.
//
// A delayed trigger watching the target (`attacksUnblocked`), for the turn
// (rule 603.7c). The cube counter goes on this artifact as it is: one that
// left and came back is a new object and gets none.

const WATCH_TEXT =
  "{2}, {T}: This turn, when target creature you control attacks and isn't blocked, it assigns no combat damage this turn and you put a cube counter on this artifact.";
const REGEN_TEXT = "{2}, Remove a cube counter from this artifact: Regenerate target creature.";

export default defineCard({
  name: "Delif's Cube",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${WATCH_TEXT}\n${REGEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "delayed-trigger",
        at: { attacksUnblocked: 0 },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "assigns-no-combat-damage", target: "trigger-object" },
            { kind: "add-counter", target: "source", counter: "cube", amount: 1 },
          ],
        },
        text: "It assigns no combat damage this turn, and you put a cube counter on Delif's Cube.",
      },
      resolve: null,
      text: WATCH_TEXT,
    },
    {
      cost: { mana: "{2}", tap: false, removeCounter: { kind: "cube", count: 1 } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
