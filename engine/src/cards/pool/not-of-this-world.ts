import { defineCard } from "../define.js";

// The reduction reads the spell or ability targeted as this is cast: one of
// its targets is a creature you control with power 7 or greater now, legal for
// it or not (the rulings; `stackObjectTargets`).
export default defineCard({
  name: "Not of This World",
  manaCost: "{7}",
  colors: [],
  types: ["kindred", "instant"],
  subtypes: ["Eldrazi"],
  text:
    "Counter target spell or ability that targets a permanent you control.\n" +
    "This spell costs {7} less to cast if it targets a spell or ability that targets a creature you control with power 7 or greater.",
  targets: [{ kind: "stack", spells: "any", abilities: true, targeting: { permanent: { controlledBy: "you" } } }],
  effect: { kind: "counter", target: 0 },
  targetCostReduction: {
    filter: { stackObjectTargets: { permanent: { type: "creature", controlledBy: "you", power: { op: "gte", n: 7 } } } },
    reduceGeneric: 7,
  },
});
