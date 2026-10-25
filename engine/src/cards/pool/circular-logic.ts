import { defineCard } from "../define.js";

// EDHREC rank 7627.
//
// The graveyard is counted as it resolves, with Circular Logic still on the
// stack, so it doesn't count itself (the ruling).
const COUNTER_TEXT = "Counter target spell unless its controller pays {1} for each card in your graveyard.";

export default defineCard({
  name: "Circular Logic",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  madness: { cost: "{U}" },
  text: `${COUNTER_TEXT}\nMadness {U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { graveyardSize: "you" }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
