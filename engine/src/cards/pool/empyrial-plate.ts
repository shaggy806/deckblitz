import { defineCard } from "../define.js";

// EDHREC rank 8783.

export default defineCard({
  name: "Empyrial Plate",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1 for each card in your hand.\nEquip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { cardsInHand: true, pt: [1, 1] },
      text: "Equipped creature gets +1/+1 for each card in your hand.",
    },
  ],
});
