import { defineCard } from "../define.js";

// EDHREC rank 2913.
//
// Rulings:
//   [2024-04-12] If you control multiple Pariahs enchanting different creatures, you choose which
//     redirection effect to apply. You can't divide damage dealt by one source or combat damage
//     dealt by multiple creatures simultaneously. For example, if a spell would deal 6 damage to
//     you and you control multiple Pariahs, you may have that 6 damage dealt to either of the
//     enchanted creatures instead, but you can't choose to have 3 damage dealt to each one.
//   [2024-04-12] If you would be dealt combat damage, the damage dealt to the enchanted creature
//     instead is still combat damage.

export default defineCard({
  name: "Pariah",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAll damage that would be dealt to you is dealt to enchanted creature instead.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", redirect: "attached" },
      text: "All damage that would be dealt to you is dealt to enchanted creature instead.",
    },
  ],
});
