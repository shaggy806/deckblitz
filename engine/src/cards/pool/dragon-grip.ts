import { defineCard } from "../define.js";

// EDHREC rank 24054.
//
// Rulings:
//   [2014-09-20] If you're using Dragon Grip's ferocious ability to cast it as though it had
//     flash, you must control a creature with power 4 or greater only as you begin the casting
//     process and put Dragon Grip on the stack.
//
// Ferocious's conditional flash is `flashIf`, read as the cast begins (rule
// 601.3d).
export default defineCard({
  name: "Dragon Grip",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashIf: {
    condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
  },
  text: "Ferocious — If you control a creature with power 4 or greater, you may cast this spell as though it had flash. (You may cast it any time you could cast an instant.)\nEnchant creature\nEnchanted creature gets +2/+0 and has first strike.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +2/+0 and has first strike.",
    },
  ],
});
