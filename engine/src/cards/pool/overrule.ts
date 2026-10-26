import { defineCard } from "../define.js";

// Dissension. The life comes whether or not {X} is paid and the spell is
// countered (the ruling).
export default defineCard({
  name: "Overrule",
  manaCost: "{X}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {X}. You gain X life.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "unless", chooser: 0, options: [{ payGeneric: "x", text: "Pay {X}." }], otherwise: { kind: "counter", target: 0 } },
      { kind: "gain-life", amount: "x" },
    ],
  },
});
