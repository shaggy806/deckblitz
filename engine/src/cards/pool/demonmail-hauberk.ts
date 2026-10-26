import { defineCard } from "../define.js";

// EDHREC rank 14764. Dissection Tools' "Equip—Sacrifice a creature."
//
// Rulings:
//   You can sacrifice the creature Demonmail Hauberk is equipping in order to equip it to another
//     creature.

export default defineCard({
  name: "Demonmail Hauberk",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +4/+2.\nEquip—Sacrifice a creature.",
  static: [{ affects: { scope: "attached" }, grantPt: [4, 2], text: "Equipped creature gets +4/+2." }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip—Sacrifice a creature.",
      sorcerySpeed: true,
    },
  ],
});
