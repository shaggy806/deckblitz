import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 12420.

export default defineCard({
  name: "Clash of Wills",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: "x", text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
