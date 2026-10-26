import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 13370. Urza's Rebuff's shape, one slot more:
// three distinct optional targets; any still legal as it resolves are tapped
// (the ruling).

export default defineCard({
  name: "Downpour",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to three target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      { kind: "tap", target: 2 },
    ],
  },
});
