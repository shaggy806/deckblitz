import { defineCard } from "../define.js";

// EDHREC rank 25093.
//
// Rulings:
//   If the damaged creature takes both lethal damage and is destroyed by this effect, you have
//     to regenerate the creature twice to keep it alive.
//
// Any damage, not only combat damage (Stinkweed Imp's shape without `combat`);
// "the other creature" is the creature dealt the damage.
const TEXT = "Whenever enchanted creature deals damage to a creature, destroy the other creature.";

export default defineCard({
  name: "Venomous Fangs",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "creature" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: TEXT,
    },
  ],
});
