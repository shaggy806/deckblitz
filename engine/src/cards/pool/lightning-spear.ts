import { defineCard } from "../define.js";

// EDHREC rank 17346. Modern Horizons 2.
//
// "It" is the sacrificed Spear, dealing the damage as it last existed.
const DAMAGE_TEXT = "{2}{R}, Sacrifice this Equipment: It deals 3 damage to any target.";

export default defineCard({
  name: "Lightning Spear",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0 and has trample.\n${DAMAGE_TEXT}\nEquip {1}`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +1/+0 and has trample.",
    },
  ],
});
