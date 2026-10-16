import { defineCard } from "../define.js";

// EDHREC rank 20051. Modern Horizons 3.
//
// "Modified" (rule 700.9) is the `modified` filter clause, read off the
// creature as it last existed on the battlefield: a counter of any kind,
// whoever put it there, an Equipment, or an Aura its controller controls
// (the rulings).
//
// Rulings:
//   [2024-06-07] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2024-06-07] An Aura controlled by another player does not cause a creature you control to be
//     modified.
//   [2024-06-07] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.

const DIES_TEXT = "Whenever another modified creature you control dies, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Ondu Knotmaster",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Kor", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${DIES_TEXT}`,
  faces: ["Ondu Knotmaster", "Throw a Line"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", modified: true }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
