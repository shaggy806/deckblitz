import { defineCard } from "../define.js";

// EDHREC rank 15934. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Solid Footing's last ability doesn't change the enchanted creature's power; it
//     changes only the amount of combat damage that creature assigns. All other rules and effects
//     that check power or toughness use the actual values.
//
// `combatDamageByToughness` resizes only combat damage (its doc), gated on the
// enchanted creature having vigilance as damage is sized.

export default defineCard({
  name: "Solid Footing",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets +1/+1.\nAs long as enchanted creature has vigilance, it assigns combat damage equal to its toughness rather than its power.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { keyword: "vigilance" } } },
      combatDamageByToughness: "always",
      text: "As long as enchanted creature has vigilance, it assigns combat damage equal to its toughness rather than its power.",
    },
  ],
});
