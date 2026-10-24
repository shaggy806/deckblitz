import { defineCard } from "../define.js";

// EDHREC rank 20972.
// Rulings: if the Aura and the creature are destroyed at the same time, the
// player still draws; the creature's controller when it died draws.

export default defineCard({
  name: "Infernal Scarring",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+0 and has \"When this creature dies, draw a card.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "When this creature dies, draw a card.",
        },
      ],
      text: "Enchanted creature gets +2/+0 and has \"When this creature dies, draw a card.\"",
    },
  ],
});
