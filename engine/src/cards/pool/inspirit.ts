import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 28530. Gerrard's Command's shape.

export default defineCard({
  name: "Inspirit",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap target creature. It gets +2/+4 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 4, duration: "end-of-turn" },
    ],
  },
});
