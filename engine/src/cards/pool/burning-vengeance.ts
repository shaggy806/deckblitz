import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a spell from your graveyard, this enchantment deals 2 damage to any target.";

// Casting only: an ability activated from the graveyard doesn't trigger it
// (the ruling). The trigger resolves before the spell.
export default defineCard({
  name: "Burning Vengeance",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "graveyard" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
