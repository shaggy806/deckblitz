import { defineCard } from "../define.js";

// EDHREC rank 17293.
//
// Rulings:
//   [2004-12-01] The triggered ability Mephidross Vampire grants to each creature you control
//     triggers on any damage dealt to any creature, not just combat damage.
//
// The granted trigger names a recipient (`to: "creature"`), so it fires once
// per creature dealt damage, combat or not (the ruling).
const STATIC_TEXT =
  'Each creature you control is a Vampire in addition to its other creature types and has "Whenever this creature deals damage to a creature, put a +1/+1 counter on this creature."';

export default defineCard({
  name: "Mephidross Vampire",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addSubtypes: ["Vampire"],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "creature" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: "Whenever this creature deals damage to a creature, put a +1/+1 counter on this creature.",
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
