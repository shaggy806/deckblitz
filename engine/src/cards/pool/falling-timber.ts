import { defineCard } from "../define.js";

// EDHREC rank 27022.
// Rulings:
//   [2004-10-04] You pick a second target only if you choose to kick Falling Timber.
//
// Magma Burst's kicker shape: a sacrifice with no mana, and the kicked
// variant's second target.

export default defineCard({
  name: "Falling Timber",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Kicker—Sacrifice a land. (You may sacrifice a land in addition to any other costs as you cast this spell.)\nPrevent all combat damage target creature would deal this turn. If this spell was kicked, prevent all combat damage another target creature would deal this turn.",
  targets: ["creature"],
  effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
  kicker: {
    cost: "",
    also: { text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } },
    targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage-rule", by: { target: 0 }, combat: true },
        { kind: "damage-rule", by: { target: 1 }, combat: true },
      ],
    },
  },
});
