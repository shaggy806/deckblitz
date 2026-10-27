import { defineCard } from "../define.js";

export default defineCard({
  name: "Lead Astray",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Tap up to two target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
