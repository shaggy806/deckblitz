import { defineCard } from "../define.js";

// EDHREC rank 16529.

export default defineCard({
  name: "Geistlight Snare",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: [
    {
      condition: { kind: "controls", filter: { subtype: "Spirit" }, atLeast: 1 },
      reduceGeneric: 1,
    },
    {
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
      reduceGeneric: 1,
    },
  ],
  text: "This spell costs {1} less to cast if you control a Spirit. It also costs {1} less to cast if you control an enchantment.\nCounter target spell unless its controller pays {3}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{3}", text: "Pay {3}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
