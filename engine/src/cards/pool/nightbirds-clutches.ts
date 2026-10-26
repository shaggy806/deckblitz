import { defineCard } from "../define.js";

// EDHREC rank 26458.

export default defineCard({
  name: "Nightbird's Clutches",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}" },
  text: "Up to two target creatures can't block this turn.\nFlashback {3}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
    ],
  },
});
