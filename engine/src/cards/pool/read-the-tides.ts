import { defineCard } from "../define.js";

export default defineCard({
  name: "Read the Tides",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one —\n• Draw three cards.\n• Return up to two target creatures to their owners' hands.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { targets: [], effect: { kind: "draw", amount: 3 }, text: "Draw three cards." },
      {
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
        text: "Return up to two target creatures to their owners' hands.",
      },
    ],
  },
});
