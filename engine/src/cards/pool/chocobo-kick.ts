import { defineCard } from "../define.js";

// EDHREC rank 6270.
//
// Either target illegal, no damage at all (the ruling), kicked or not: a `fight`
// reads both, and the kicked damage is from slot 0 to slot 1, Polliwallop's shape.

export default defineCard({
  name: "Chocobo Kick",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker—Return a land you control to its owner's hand. (You may return a land you control to its owner's hand in addition to any other costs as you cast this spell.)\nTarget creature you control deals damage equal to its power to target creature an opponent controls. If this spell was kicked, the creature you control deals twice that much damage instead.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
  kicker: {
    cost: "",
    also: { returnToHand: { filter: { type: "land" }, count: 1 }, text: "Return a land you control to its owner's hand" },
    effect: {
      kind: "conditional",
      condition: { kind: "target-legal", index: 0 },
      then: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 1, from: { target: 0 } },
    },
  },
});
