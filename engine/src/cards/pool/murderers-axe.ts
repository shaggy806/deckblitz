import { defineCard } from "../define.js";

// EDHREC rank 24789. Dissection Tools' "Equip—[non-mana cost]" shape, the
// cost a discard.

export default defineCard({
  name: "Murderer's Axe",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+2.\nEquip—Discard a card.",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip—Discard a card.",
      sorcerySpeed: true,
    },
  ],
});
