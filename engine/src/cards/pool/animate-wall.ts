import { defineCard } from "../define.js";

// EDHREC rank 21831.
// Ruling (2007-09-16): Animate Wall can enchant only a Wall.

export default defineCard({
  name: "Animate Wall",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant Wall\nEnchanted Wall can attack as though it didn't have defender.",
  targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
  static: [
    {
      affects: { scope: "attached" },
      canAttackAsThoughNoDefender: true,
      text: "Enchanted Wall can attack as though it didn't have defender.",
    },
  ],
});
