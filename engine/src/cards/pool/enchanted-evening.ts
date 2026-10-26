import { defineCard } from "../define.js";

// Rulings: [2008-05-01] This has no effect on those permanents other than letting them interact
// with things that care about enchantments.

export default defineCard({
  name: "Enchanted Evening",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: "All permanents are enchantments in addition to their other types.",
  static: [
    {
      affects: { scope: "filter", filter: {} },
      addTypes: ["enchantment"],
      text: "All permanents are enchantments in addition to their other types.",
    },
  ],
});
