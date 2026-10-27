import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 21156.

export default defineCard({
  name: "Multani's Harmony",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{T}: Add one mana of any color.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." }),
      ],
      text: 'Enchanted creature has "{T}: Add one mana of any color."',
    },
  ],
});
