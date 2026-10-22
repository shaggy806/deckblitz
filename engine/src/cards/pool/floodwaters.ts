import { defineCard } from "../define.js";

export default defineCard({
  name: "Floodwaters",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Return up to two target creatures to their owners' hands.\nCycling {2} ({2}, Discard this card: Draw a card.)",
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
