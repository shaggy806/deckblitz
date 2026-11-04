import { defineCard } from "../define.js";

export default defineCard({
  name: "Synchronized Eviction",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if you control at least two creatures that share a creature type.\nPut target nonland permanent into its owner's library second from the top.",
  selfCostReduction: {
    condition: {
      kind: "aggregate",
      value: { aggregate: "greatest-shared-creature-type", filter: { type: "creature", controlledBy: "you" } },
      compare: { op: "gte", n: 2 },
    },
    reduceGeneric: 2,
  },
  targets: [{ kind: "permanent", whose: "any", filter: { notTypes: ["land"] } }],
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
});
