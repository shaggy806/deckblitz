import { defineCard } from "../define.js";

export default defineCard({
  name: "Into the Void",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
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
