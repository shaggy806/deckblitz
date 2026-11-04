import { defineCard } from "../define.js";

// The block is by the effect, so an attacker with "can't be blocked" is stopped
// too, and one with trample still assigns all its damage to what it's attacking
// (rule 702.19e).
export default defineCard({
  name: "Fog Patch",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during the declare blockers step.\nAttacking creatures become blocked. (This spell works on creatures that can't be blocked.)",
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers"] },
  targets: [],
  effect: { kind: "become-blocked", filter: { type: "creature", attacking: true } },
});
