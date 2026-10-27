import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 25268.
//
// Rulings:
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//
// The target player exists only when kicked (Tear Asunder's `kicker.targets`).
export default defineCard({
  name: "Probe",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Kicker {1}{B} (You may pay an additional {1}{B} as you cast this spell.)\nDraw three cards, then discard two cards. If this spell was kicked, target player discards two cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 2 },
    ],
  },
  kicker: {
    cost: "{1}{B}",
    targets: ["player"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 3 },
        { kind: "discard", target: "you", amount: 2 },
        { kind: "discard", target: 0, amount: 2 },
      ],
    },
  },
});
