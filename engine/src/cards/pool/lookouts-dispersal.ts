import { defineCard } from "../define.js";

// EDHREC rank 10752. Ixalan. Arcane Epiphany's conditional {1} off, over
// Confounding Riddle's soft counter.
export default defineCard({
  name: "Lookout's Dispersal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if you control a Pirate.\nCounter target spell unless its controller pays {4}.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Pirate" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: ["spell"],
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{4}", text: "Pay {4}" }], otherwise: { kind: "counter", target: 0 } },
});
