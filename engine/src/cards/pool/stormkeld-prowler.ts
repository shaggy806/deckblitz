import { defineCard } from "../define.js";

// EDHREC rank 26140.
//
// Rulings:
//   [2023-09-01] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.

const TEXT = "Whenever you cast a spell with mana value 5 or greater, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Stormkeld Prowler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
