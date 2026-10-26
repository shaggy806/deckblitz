import { defineCard } from "../define.js";

// Rulings:
//   The two creatures may have different owners and return to their respective owner's hands.

export default defineCard({
  name: "Undo",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return two target creatures to their owners' hands.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
