import { defineCard } from "../define.js";

// EDHREC rank 15539.
//
// Rulings:
//   [2024-04-12] If the creature Reach for the Sky would enchant is an illegal target by the time
//     the Aura spell resolves, the entire spell doesn't resolve. It's put into your graveyard from
//     the stack, not the battlefield, so its triggered ability won't trigger.

export default defineCard({
  name: "Reach for the Sky",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets +3/+2 and has reach.\nWhen this Aura is put into a graveyard from the battlefield, draw a card.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 2],
      grantKeywords: ["reach"],
      text: "Enchanted creature gets +3/+2 and has reach.",
    },
  ],
  triggered: [
    {
      // Only from the battlefield: an Aura spell whose target went illegal is
      // put into the graveyard from the stack and doesn't draw (the ruling).
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, draw a card.",
    },
  ],
});
