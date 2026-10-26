import { defineCard } from "../define.js";

// EDHREC rank 19951.
//
// Rulings:
//   [2010-06-15] A "blocked creature" is an attacking creature that has been blocked by a creature
//     this combat, or has become blocked as the result of a spell or ability this combat. Unless
//     the attacking creature leaves combat, it continues to be a blocked creature through the end
//     of combat step, even if the creature or creatures that blocked it are no longer on the
//     battlefield or have otherwise left combat by then.
//
// A blocked creature is an attacker that isn't unblocked from the declare
// blockers step to the end of combat (Fight to the Death's filter). Before
// blockers are declared an attacker is neither, but `unblocked: false` would
// match it: outside those steps there is no blocked creature to target, so
// the spell can't be cast then (rule 601.2c) — `castOnlyIf` says exactly
// that, and a copy is made only while Smite is on the stack, in those steps.

export default defineCard({
  name: "Smite",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target blocked creature.",
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, unblocked: false } }],
  effect: { kind: "destroy", target: 0 },
});
