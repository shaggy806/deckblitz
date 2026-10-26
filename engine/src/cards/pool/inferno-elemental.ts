import { defineCard } from "../define.js";

// Rulings: it triggers once for each creature it blocks or becomes blocked by;
// the 3 damage isn't combat damage and resolves in the declare blockers step.

export default defineCard({
  name: "Inferno Elemental",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 3 damage to that creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 3, target: "trigger-object" },
      resolve: null,
      text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 3 damage to that creature.",
    },
  ],
});
