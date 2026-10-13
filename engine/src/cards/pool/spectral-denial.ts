import { defineCard } from "../define.js";

// EDHREC rank 7989.
//
// The reduction comes off the total cost, {X} included (rule 601.2f); the
// {X} the controller must pay is the X chosen, whatever was paid for it.

export default defineCard({
  name: "Spectral Denial",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each creature you control with power 4 or greater.\nCounter target spell unless its controller pays {X}.",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", power: { op: "gte", n: 4 }, controlledBy: "you" } },
  },
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: "x", text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
