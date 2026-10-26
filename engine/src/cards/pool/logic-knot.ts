import { defineCard } from "../define.js";

export default defineCard({
  name: "Logic Knot",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nCounter target spell unless its controller pays {X}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: "x", text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
