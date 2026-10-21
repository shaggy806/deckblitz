import { defineCard } from "../define.js";

// EDHREC rank 23343.

export default defineCard({
  name: "Seismic Shift",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target land. Up to two target creatures can't block this turn.",
  targets: [
    "land",
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
    ],
  },
});
