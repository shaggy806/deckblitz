import { defineCard } from "../define.js";

export default defineCard({
  name: "Warmonger's Chariot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+2.\nAs long as equipped creature has defender, it can attack as though it didn't have defender.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
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
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." },
    {
      // "As long as it has defender" needs no condition: the permission only
      // matters to a creature with defender, and doesn't take defender away
      // (the rulings).
      affects: { scope: "attached" },
      canAttackAsThoughNoDefender: true,
      text: "As long as equipped creature has defender, it can attack as though it didn't have defender.",
    },
  ],
});
