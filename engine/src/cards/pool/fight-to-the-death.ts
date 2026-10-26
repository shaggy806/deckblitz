import { defineCard } from "../define.js";

// A "blocked creature" is an attacker blocked this combat (rule 509.1h): from
// the declare blockers step to the end of combat, an attacker that isn't
// unblocked. Before blockers are declared nothing is blocking or blocked, so
// the spell does nothing then (the ruling) — the step gate keeps the
// `unblocked: false` clause from matching attackers not yet blocked.
export default defineCard({
  name: "Fight to the Death",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Destroy all blocking creatures and all blocked creatures.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-structure", steps: ["declare-blockers", "combat-damage", "end-combat"] },
    then: {
      kind: "destroy-all",
      filter: {
        type: "creature",
        anyOf: [{ blocking: true }, { attacking: true, unblocked: false }],
      },
    },
  },
});
