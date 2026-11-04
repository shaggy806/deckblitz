import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. EDHREC rank 21385.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.

export default defineCard({
  name: "Flame Discharge",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flame Discharge deals X damage to target creature or planeswalker. If you controlled a modified creature as you cast this spell, it deals X plus 2 damage instead. (Equipment, Auras you control, and counters are modifications.)",
  asCast: [{ condition: { kind: "controls", filter: { type: "creature", modified: true }, atLeast: 1 } }],
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "damage",
    amount: { sum: ["x", { ifCondition: { kind: "as-cast", fact: 0 }, then: 2, else: 0 }] },
    target: 0,
  },
});
