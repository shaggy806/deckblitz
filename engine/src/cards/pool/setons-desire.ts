import { defineCard } from "../define.js";

// EDHREC rank 21559.
//
// Rulings:
//   [2004-10-04] If a creature the defending player controls can't block the enchanted creature
//     for any reason (such as being tapped), then it doesn't block that creature. If there's a
//     cost associated with having a creature block the enchanted creature, the defending player
//     isn't forced to pay that cost, so it doesn't have to block in that case either.

const LURE =
  "Threshold — As long as there are seven or more cards in your graveyard, all creatures able to block enchanted creature do so.";

export default defineCard({
  name: "Seton's Desire",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2.\n${LURE}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: { kind: "threshold" },
      restrictions: ["must-be-blocked"],
      text: LURE,
    },
  ],
});
