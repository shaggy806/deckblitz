import { defineCard } from "../define.js";

// EDHREC rank 23033.
//
// Once for each creature it blocks or becomes blocked by (the ruling).
const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.";

export default defineCard({
  name: "Ashmouth Hound",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Dog"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
