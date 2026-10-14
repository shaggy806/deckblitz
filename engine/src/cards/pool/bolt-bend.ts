import { defineCard } from "../define.js";

// "With a single target" (rule 115.9a) is the target spec's `singleTarget`:
// one target chosen as that spell or ability went on the stack, however many
// are still legal (the rulings). The new target is chosen as Bolt Bend
// resolves, and must be another legal one if there is one (rule 115.7a).
export default defineCard({
  name: "Bolt Bend",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "This spell costs {3} less to cast if you control a creature with power 4 or greater.\n" +
    "Change the target of target spell or ability with a single target.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
    reduceGeneric: 3,
  },
  targets: [{ kind: "stack", spells: "any", abilities: true, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
