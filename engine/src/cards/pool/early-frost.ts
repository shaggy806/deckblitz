import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 25506. Downpour's "up to three" over lands.

export default defineCard({
  name: "Early Frost",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to three target lands.",
  targets: [
    { kind: "optional", of: "land" },
    { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0, 1] } } },
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
