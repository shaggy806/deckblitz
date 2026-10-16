import { defineCard } from "../define.js";

// EDHREC rank 20381. Modern Horizons 3.
//
// "A modified creature you control" (rule 700.9) includes this one: the
// `modified` clause read off the creature as it last existed (Ondu
// Knotmaster). Manifest is the `manifest` effect (Reality Shift).
//
// Rulings:
//   [2024-06-07] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2024-06-07] An Aura controlled by another player does not cause a creature you control to be
//     modified.
//   [2024-06-07] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.

const DIES_TEXT =
  "Whenever a modified creature you control dies, manifest the top card of your library. (Equipment, Auras you control, and counters are modifications. To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Guardian of the Forgotten",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", modified: true } },
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
