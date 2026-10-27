import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 18790.
//
// Rulings:
//   [2004-10-04] If the opponent only has lands that produce colorless or no mana, this card's
//     ability can still be activated; it just won't produce any mana.

export default defineCard({
  name: "Quirion Explorer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Scout"],
  power: 1,
  toughness: 1,
  text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "opponents-lands" }, amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
    },
  ],
});
