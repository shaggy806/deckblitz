import { defineCard } from "../define.js";

// EDHREC rank 25842.
//
// Rulings:
//   [2026-06-29] If you activate the last ability of Eagle's Rescue and the target creature
//     becomes an illegal target in response, the ability doesn't resolve and Eagle's Rescue
//     remains in your graveyard.

export default defineCard({
  name: "Eagle's Rescue",
  manaCost: "{2}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 and has flying.\n{2}{W/U}{W/U}: Return this card from your graveyard to the battlefield attached to target creature you control with power 1 or less. Activate only as a sorcery.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{W/U}{W/U}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      // An illegal target and the ability doesn't resolve: Eagle's Rescue
      // stays in the graveyard (the ruling).
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", power: { op: "lte", n: 1 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: "source", attachedTo: 0 },
      resolve: null,
      text: "{2}{W/U}{W/U}: Return this card from your graveyard to the battlefield attached to target creature you control with power 1 or less. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
});
