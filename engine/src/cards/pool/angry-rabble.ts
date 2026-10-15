import { defineCard } from "../define.js";

// EDHREC rank 18546.
//
// Rulings:
//   [2025-09-19] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.

const CAST_TEXT =
  "Whenever you cast a spell with mana value 4 or greater, this creature deals 1 damage to each opponent.";
const GROW_TEXT = "{5}{R}: Put two +1/+1 counters on this creature. Activate only as a sorcery.";

export default defineCard({
  name: "Angry Rabble",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}\n${GROW_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: GROW_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
