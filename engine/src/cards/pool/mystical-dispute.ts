import { defineCard } from "../define.js";

// EDHREC rank 10889. Throne of Eldraine.
//
// Out of Air's `targetCostReduction` over a blue spell, and Confounding
// Riddle's punisher counter.

export default defineCard({
  name: "Mystical Dispute",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets a blue spell.\nCounter target spell unless its controller pays {3}.",
  targets: ["spell"],
  targetCostReduction: { filter: { colors: ["U"] }, reduceGeneric: 2 },
  effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
});
