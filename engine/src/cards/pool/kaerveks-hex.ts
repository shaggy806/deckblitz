import { defineCard } from "../define.js";

// One damage to each nonblack creature plus one more to each green one, dealt
// at once: each creature takes its whole share as one event — 2 to a
// nonblack green creature, 1 to a black-green one (the ruling), 1 to any
// other nonblack creature — so the three groups are disjoint filters.
export default defineCard({
  name: "Kaervek's Hex",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kaervek's Hex deals 1 damage to each nonblack creature and an additional 1 damage to each green creature.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notColors: ["B", "G"] }, amount: 1 },
      { kind: "damage-all", filter: { type: "creature", colors: ["G"], notColors: ["B"] }, amount: 2 },
      { kind: "damage-all", filter: { type: "creature", colors: ["B", "G"] }, amount: 1 },
    ],
  },
});
