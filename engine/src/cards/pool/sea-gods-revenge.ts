import { defineCard } from "../define.js";

export default defineCard({
  name: "Sea God's Revenge",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to three target creatures your opponents control to their owners' hands. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: [
    { kind: "optional", of: "creature-an-opponent-controls" },
    { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
          { kind: "return-to-hand", target: 2 },
        ],
      },
      { kind: "scry", amount: 1 },
    ],
  },
});
