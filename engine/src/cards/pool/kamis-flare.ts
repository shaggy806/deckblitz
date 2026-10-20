import { defineCard } from "../define.js";

// EDHREC rank 22358.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//
// Misthios's Fury's shape: the condition is read as the spell resolves; the
// controller is read off the target (as it last existed, if it's gone).

const TEXT =
  "Kami's Flare deals 3 damage to target creature or planeswalker. Kami's Flare also deals 2 damage to that permanent's controller if you control a modified creature.";

export default defineCard({
  name: "Kami's Flare",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", modified: true }, atLeast: 1 },
        then: { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      },
    ],
  },
});
