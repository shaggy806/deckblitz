import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 12827.
//
// Rulings:
//   The new colour overwrites the creature's old colours.

export default defineCard({
  name: "Niveous Wisps",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature becomes white until end of turn. Tap that creature.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-color", target: 0, colors: ["W"], duration: "end-of-turn" },
      { kind: "tap", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
