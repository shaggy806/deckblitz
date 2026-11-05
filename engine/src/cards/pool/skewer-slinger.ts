import { defineCard } from "../define.js";

// EDHREC rank 20101.

export default defineCard({
  name: "Skewer Slinger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Knight"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.",
    },
  ],
});
