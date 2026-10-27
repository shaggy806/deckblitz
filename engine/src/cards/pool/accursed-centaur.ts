import { defineCard } from "../define.js";

// EDHREC rank 23409.
//
// Rulings:
//   If Accursed Centaur is the only creature on the battlefield, you must sacrifice it.

const TEXT = "When this creature enters, sacrifice a creature.";

export default defineCard({
  name: "Accursed Centaur",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Centaur"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
