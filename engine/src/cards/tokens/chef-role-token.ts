import { defineCard } from "../define.js";

// A colorless Aura Role enchantment token named Chef (rule 111.10m's shape) — Ratatwotwo's. No
// token printing of it exists.
export default defineCard({
  name: "Chef Role Token",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: 'Enchant creature\nEnchanted creature gets +1/+1 and has "Whenever this creature attacks, create a Food token."',
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "create-token", token: "Food Token", count: 1 },
          resolve: null,
          text: "Whenever this creature attacks, create a Food token.",
        },
      ],
      text: 'Enchanted creature gets +1/+1 and has "Whenever this creature attacks, create a Food token."',
    },
  ],
});
