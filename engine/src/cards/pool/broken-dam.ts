import { defineCard } from "../define.js";

// EDHREC rank 25656.

export default defineCard({
  name: "Broken Dam",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap one or two target creatures without horsemanship.",
  targets: [
    { kind: "permanent", filter: { type: "creature", notKeyword: "horsemanship" } },
    {
      kind: "optional",
      of: {
        kind: "other",
        of: { kind: "permanent", filter: { type: "creature", notKeyword: "horsemanship" } },
        than: { slot: 0 },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
});
