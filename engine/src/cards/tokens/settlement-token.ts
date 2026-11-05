import { defineCard } from "../define.js";

// Preston Garvey, Minuteman's Settlement token.
export default defineCard({
  name: "Settlement Token",
  tokenName: "Settlement",
  art: "02789d01-f939-4515-a6e4-db6aff36f893",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: 'Enchant land\nEnchanted land has "{T}: Add one mana of any color."',
  targets: ["land"],
  static: [
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
      text: 'Enchanted land has "{T}: Add one mana of any color."',
    },
  ],
});
