import { defineCard } from "../define.js";

// EDHREC rank 26329.
//
// Rulings:
//   [2012-05-01] You still decide which player or planeswalker the equipped creature attacks.
//   [2012-05-01] If, during your declare attackers step, the equipped creature is tapped, is
//     affected by a spell or ability that says it can’t attack, or hasn’t been under your control
//     continuously since the turn began (and doesn’t have haste), then it doesn’t attack. If
//     there’s a cost associated with having a creature attack, you’re not forced to pay that cost,
//     so it doesn’t have to attack in that case either.

export default defineCard({
  name: "Tormentor's Trident",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +3/+0 and attacks each combat if able.\nEquip {3}",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      restrictions: ["must-attack"],
      text: "Equipped creature gets +3/+0 and attacks each combat if able.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
