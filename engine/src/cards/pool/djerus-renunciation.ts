import { defineCard } from "../define.js";

// EDHREC rank 23465.

export default defineCard({
  name: "Djeru's Renunciation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{W}" },
  text: "Tap up to two target creatures.\nCycling {W} ({W}, Discard this card: Draw a card.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
