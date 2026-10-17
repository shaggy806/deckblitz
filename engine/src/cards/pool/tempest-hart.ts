import { defineCard } from "../define.js";

// EDHREC rank 12321.
//
// Rulings:
//   [2023-09-01] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.
//
// Lurking Lizards' shape: the cast trigger reads the spell's mana value on the
// stack, its chosen X included.

const GROW_TEXT = "Whenever you cast a spell with mana value 5 or greater, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Tempest Hart",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Elk"],
  power: 3,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${GROW_TEXT}`,
  faces: ["Tempest Hart", "Scan the Clouds"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
