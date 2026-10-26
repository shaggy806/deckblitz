import { defineCard } from "../define.js";

// EDHREC rank 29027.
//
// Rulings:
//   [2009-10-01] Entangling Vines can enchant only a creature that's tapped. If at any time the
//     enchanted creature is untapped, Entangling Vines is put into its owner's graveyard as a
//     state-based action.
//   [2009-10-01] If Entangling Vines is cast as a spell, it can target only a tapped creature. If
//     the creature has become untapped by the time Entangling Vines would resolve, it's countered
//     and put into its owner's graveyard from the stack.
//
// The enchant restriction is the target spec: the state-based check (704.5m, `canEnchant`)
// re-reads it, so an untapped host sends the Aura to the graveyard.
export default defineCard({
  name: "Entangling Vines",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant tapped creature\nEnchanted creature doesn't untap during its controller's untap step.",
  targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
