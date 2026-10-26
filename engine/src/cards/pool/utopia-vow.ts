import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 22948.

export default defineCard({
  name: "Utopia Vow",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.\nEnchanted creature has \"{T}: Add one mana of any color.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}: Add one mana of any color.",
        },
      ],
      text: "Enchanted creature has \"{T}: Add one mana of any color.\"",
    },
  ],
});
