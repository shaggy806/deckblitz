import { defineCard } from "../define.js";

// EDHREC rank 18798.
//
// Rulings:
//   [2025-09-19] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.

const CAST_TEXT = "Whenever you cast a spell with mana value 4 or greater, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Lurking Lizards",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard", "Villain"],
  power: 1,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
