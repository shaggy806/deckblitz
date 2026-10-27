import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 28593. Downpour's shape: three
// distinct optional targets, each still legal one tapped.

export default defineCard({
  name: "Terashi's Cry",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
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
