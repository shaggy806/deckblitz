import { defineCard } from "../define.js";

// EDHREC rank 4206.
//
// Rulings:
//   [2024-03-08] Use Feral Ghoul's power as it last existed on the battlefield to determine how
//     many rad counters each opponent gets.
//
// `powerOf: "source"` on a dies trigger reads the creature as it last existed
// (Flaming Tyrannosaurus's shape).

const GROW_TEXT = "Whenever another creature you control dies, put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, each opponent gets a number of rad counters equal to its power.";

export default defineCard({
  name: "Feral Ghoul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${GROW_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: { powerOf: "source" }, who: "each-opponent" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
