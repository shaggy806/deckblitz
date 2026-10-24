import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 27485.
//
// Two distinct targets, both required: the second slot excludes the first
// (the ruling — not the same one twice).
export default defineCard({
  name: "Furious Reprisal",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Furious Reprisal deals 2 damage to each of two targets.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
