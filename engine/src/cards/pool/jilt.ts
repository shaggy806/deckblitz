import { defineCard } from "../define.js";

// EDHREC rank 29762.

export default defineCard({
  name: "Jilt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\nReturn target creature to its owner's hand. If this spell was kicked, it deals 2 damage to another target creature.",
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
  kicker: {
    cost: "{1}{R}",
    targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "return-to-hand", target: 0 },
        { kind: "damage", target: 1, amount: 2 },
      ],
    },
  },
});
