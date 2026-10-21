import { defineCard } from "../define.js";

// EDHREC rank 26997.
//
// Read the Tides' shape with a third slot: the creatures go back as one event.

export default defineCard({
  name: "Captivating Gyre",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to three target creatures to their owners' hands.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
      { kind: "return-to-hand", target: 2 },
    ],
  },
});
