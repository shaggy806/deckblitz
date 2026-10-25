import { defineCard } from "../define.js";

// EDHREC rank 30040. Read the Tides' shape.

export default defineCard({
  name: "Waterwhirl",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return up to two target creatures to their owners' hands.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
