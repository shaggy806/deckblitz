import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 25171.

export default defineCard({
  name: "Gerrard's Command",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Untap target creature. It gets +3/+3 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
    ],
  },
});
