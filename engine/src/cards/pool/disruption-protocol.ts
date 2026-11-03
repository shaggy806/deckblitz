import { defineCard } from "../define.js";

const TAP = "Tap an untapped artifact you control";

export default defineCard({
  name: "Disruption Protocol",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, tap an untapped artifact you control or pay {1}.\nCounter target spell.",
  additionalCost: {
    options: [
      { text: TAP, also: { text: TAP, tapUntapped: { filter: { type: "artifact" }, count: 1 } } },
      { text: "Pay {1}", mana: "{1}" },
    ],
  },
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
