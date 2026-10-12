import { defineCard } from "../define.js";

// EDHREC rank 11680.
//
// Rulings:
//   [2025-11-17] If a spell has {X} in its mana cost, use the value chosen for that X to determine
//     the mana value of that spell.
//
// Spider Manifestation's trigger: a spell's `manaValue` on the stack counts
// its chosen {X} (rule 202.3e).
const TEXT = "Whenever you cast a spell with mana value 4 or greater, draw a card.";

export default defineCard({
  name: "Tanufel Rimespeaker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
