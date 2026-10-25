import { defineCard } from "../define.js";

export default defineCard({
  name: "Glimpse the Sun God",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap X target creatures. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
      { kind: "scry", amount: 1 },
    ],
  },
});
