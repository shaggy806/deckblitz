import { defineCard } from "../define.js";

// Dissension. Its colours are counted as it resolves.
const PER_COLOR = { product: [2, { colorsOf: 0 }] } as const;

export default defineCard({
  name: "Might of the Nephilim",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn for each of its colors.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: PER_COLOR, toughness: PER_COLOR, duration: "end-of-turn" },
});
