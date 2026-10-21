import { defineCard } from "../define.js";

// Theros Beyond Death. `setTypes` (layer 4) replaces its card types, and the
// subtypes that went only with a lost type go too while supertypes stay (rule
// 205.1a — its rulings); with no power or toughness left it isn't a creature.

export default defineCard({
  name: "One with the Stars",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature or enchantment\nEnchanted permanent is an enchantment and loses all other card types. (It still has its abilities, but it's no longer a creature.)",
  targets: ["creature-or-enchantment"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["enchantment"],
      text: "Enchanted permanent is an enchantment and loses all other card types.",
    },
  ],
});
