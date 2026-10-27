import { defineCard } from "../define.js";

// EDHREC rank 22924.
//
// One target; the creatures sharing its name (rule 201.2a) are dealt the
// damage too, targeted or not (`CardFilter.sameNameAsTarget`).

export default defineCard({
  name: "Homing Lightning",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Homing Lightning deals 4 damage to target creature and each other creature with the same name as that creature.",
  targets: ["creature"],
  effect: { kind: "damage-all", filter: { type: "creature", sameNameAsTarget: 0 }, amount: 4 },
});
