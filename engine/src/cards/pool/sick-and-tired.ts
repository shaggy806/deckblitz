import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] Must target two different creatures.

export default defineCard({
  name: "Sick and Tired",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Two target creatures each get -1/-1 until end of turn.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -1, toughness: -1, duration: "end-of-turn" },
    ],
  },
});
