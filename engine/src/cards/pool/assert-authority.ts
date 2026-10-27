import { defineCard } from "../define.js";

// EDHREC rank 12354. Mirrodin.
//
// Affinity for artifacts is Somber Hoverguard's self cost reduction; the
// counter is Dissipate's.

export default defineCard({
  name: "Assert Authority",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nCounter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "exile" },
});
