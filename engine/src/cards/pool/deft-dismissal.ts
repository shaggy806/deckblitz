import { defineCard } from "../define.js";

// EDHREC rank 30836.
//
// Ral, Caller of Storms' divided damage, on a spell and only among attacking
// or blocking creatures: the division is chosen as it's cast, each target
// getting at least 1 (rule 601.2d).
//
// Rulings:
//   [2017-02-09] If some (but not all) of the targets become illegal, the original division of
//     damage still applies, but no damage is dealt to illegal targets. If all targets become
//     illegal, Deft Dismissal doesn't resolve.

export default defineCard({
  name: "Deft Dismissal",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Deft Dismissal deals 3 damage divided as you choose among one, two, or three target attacking or blocking creatures.",
  targets: [{ kind: "any-number", of: "attacking-or-blocking-creature", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
