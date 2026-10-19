import { defineCard } from "../define.js";

// EDHREC rank 8053.
// Daring Discovery's three optional slots, each restricted and goaded.

export default defineCard({
  name: "Coronation of Chaos",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Up to three target creatures can't block this turn. Goad them. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
      { kind: "goad", target: 0 },
      { kind: "goad", target: 1 },
      { kind: "goad", target: 2 },
    ],
  },
});
