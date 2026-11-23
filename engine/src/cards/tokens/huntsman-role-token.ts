import { defineCard } from "../define.js";

// Garruk's Lost Wolf's Huntsman Role: no token printing of it in the Oracle
// snapshot.
export default defineCard({
  name: "Huntsman Role Token",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: 'Enchant creature\nEnchanted creature gets +1/+1 and has "{T}: Add {G}."',
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: 1 },
          resolve: null,
          text: "{T}: Add {G}.",
        },
      ],
      text: 'Enchanted creature gets +1/+1 and has "{T}: Add {G}."',
    },
  ],
});
