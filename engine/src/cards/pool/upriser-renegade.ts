import { defineCard } from "../define.js";

// EDHREC rank 16018.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
const PT_TEXT = "This creature gets +2/+0 for each other modified creature you control.";

export default defineCard({
  name: "Upriser Renegade",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 1,
  toughness: 3,
  text: `${PT_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you", modified: true },
        pt: [2, 0],
        excludeSelf: true,
      },
      text: PT_TEXT,
    },
  ],
});
