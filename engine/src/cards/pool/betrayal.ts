import { defineCard } from "../define.js";

// EDHREC rank 13690.
//
// Rulings:
//   [2004-10-04] If it ever enchants a creature that isn't controlled by an opponent of Betrayal's
//     controller, then it's put into the graveyard as a State-Based Action.
//
// The enchant restriction is rechecked as a state-based action against the
// Aura's controller (rule 704.5m — Nurgle's Rot's shape).

export default defineCard({
  name: "Betrayal",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature an opponent controls\nWhenever enchanted creature becomes tapped, you draw a card.",
  targets: ["creature-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever enchanted creature becomes tapped, you draw a card.",
    },
  ],
});
