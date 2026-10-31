import { defineCard } from "../define.js";

// Not "you may": the targets assign their combat damage to what they're
// attacking, with no choice — and only targets that are blocked creatures,
// from the declare blockers step to the end of combat.
export default defineCard({
  name: "Outmaneuver",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "X target blocked creatures assign their combat damage this turn as though they weren't blocked.",
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", blocked: true } }, min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "assign-as-though-unblocked", target: 0 },
  },
});
