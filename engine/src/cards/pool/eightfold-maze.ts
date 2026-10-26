import { defineCard } from "../define.js";

// EDHREC rank 30549.
//
// Rulings:
//   If all the attacking creatures attack your planeswalkers, you can't cast Eightfold Maze. To
//   cast it, a creature needs to have attacked you.
//   If you're able to cast Eightfold Maze, it can target any attacking creature (including one
//   attacking a planeswalker).

export default defineCard({
  name: "Eightfold Maze",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nDestroy target attacking creature.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "destroy", target: 0 },
});
