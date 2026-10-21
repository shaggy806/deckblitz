import { defineCard } from "../define.js";

// EDHREC rank 24210.
//
// Rulings:
//   [2019-10-04] Whether the target creature is a Knight is checked only as the equip Knight
//     ability is activated and as that ability resolves. If the creature somehow becomes a
//     non-Knight creature later, Steelclaw Lance remains attached to it.
//
// "Equip Knight {1}" is an equip ability that can only target a Knight you
// control (rule 702.6a's "Equip [quality]") — Syr Gwyn's grant, printed here.

export default defineCard({
  name: "Steelclaw Lance",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+2.\nEquip Knight {1}\nEquip {3}",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Knight" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Knight {1}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
});
