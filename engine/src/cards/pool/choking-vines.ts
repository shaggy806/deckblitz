import { defineCard } from "../define.js";

// Unlike Curtain of Light, any attacker can be targeted: one already blocked
// stays as it is, and is still dealt the damage.
export default defineCard({
  name: "Choking Vines",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during the declare blockers step.\nX target attacking creatures become blocked. Choking Vines deals 1 damage to each of those creatures. (This spell works on creatures that can't be blocked.)",
  castOnlyIf: { kind: "turn-structure", steps: ["declare-blockers"] },
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: true } }, min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "become-blocked", target: 0 } },
      { kind: "for-each-target", from: 0, effect: { kind: "damage", amount: 1, target: 0 } },
    ],
  },
});
