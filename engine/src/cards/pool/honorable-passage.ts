import { defineCard } from "../define.js";

// EDHREC rank 25228.
//
// A prevention shield on the target from the source chosen as it resolves
// (rule 609.7a). Its additional effect (615.5) runs right after the
// prevention, the damage's source its "trigger-object" (as Deflecting Palm's
// "that source's controller" reads it): only a red one is hit back.

export default defineCard({
  name: "Honorable Passage",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next time a source of your choice would deal damage to any target this turn, prevent that damage. If damage from a red source is prevented this way, Honorable Passage deals that much damage to the source's controller.",
  targets: ["any-target"],
  effect: {
    kind: "prevent-damage-from-chosen-source",
    to: 0,
    amount: "next-time",
    then: {
      kind: "conditional",
      condition: { kind: "trigger-object", filter: { colors: ["R"] } },
      then: { kind: "damage", amount: "x", who: "trigger-controller" },
    },
  },
});
