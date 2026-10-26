import { defineCard } from "../define.js";

// Ruling: the targeted player chooses as it resolves; metalcraft is read then too.

export default defineCard({
  name: "Dispense Justice",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player sacrifices an attacking creature of their choice.\nMetalcraft — That player sacrifices two attacking creatures of their choice instead if you control three or more artifacts.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "metalcraft" },
    then: { kind: "sacrifice", who: "target", filter: { type: "creature", attacking: true }, count: 2 },
    else: { kind: "sacrifice", who: "target", filter: { type: "creature", attacking: true }, count: 1 },
  },
});
