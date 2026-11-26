import { defineCard } from "../define.js";

// Any spell can be targeted; as Meddle resolves it works only on a spell with
// exactly one target, a creature (the ruling: not a spell aimed at a creature
// and a player), whose new target must be another creature legal for it
// (`newTargetIs`, rule 115.7a). With none, the target stays.

export default defineCard({
  name: "Meddle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "If target spell has only one target and that target is a creature, change that spell's target to another creature.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { targets: { count: 1, permanent: { type: "creature" } } } },
    then: { kind: "change-targets", target: 0, how: "change", newTargetIs: { type: "creature" } },
  },
});
