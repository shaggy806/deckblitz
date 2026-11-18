import { defineCard } from "../define.js";

// Rulings:
//   A creature with a counter on it is considered modified no matter what kind of counter it is
//   or which player put it on that creature.
//   A creature that is equipped is considered modified no matter who controls the Equipment
//   that's attached to it.
//   An Aura controlled by another player does not cause a creature you control to be modified.
//
// A choice between two whole additional costs (rule 601.2b — Bone Shards' shape): the second,
// "sacrifice a modified creature", is the one the draw reads (`self-cost-option-paid`). A
// modified creature sacrificed for the first draws nothing.

export default defineCard({
  name: "Lethal Throwdown",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a creature or sacrifice a modified creature. (Equipment, Auras you control, and counters are modifications.)\nDestroy target creature or planeswalker. If the modified creature was sacrificed, draw a card.",
  additionalCost: {
    options: [
      { text: "Sacrifice a creature", sacrifice: { type: "creature", controlledBy: "you" } },
      { text: "Sacrifice a modified creature", sacrifice: { type: "creature", controlledBy: "you", modified: true } },
    ],
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "self-cost-option-paid", option: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
