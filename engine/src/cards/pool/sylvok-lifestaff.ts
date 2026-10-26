import { defineCard } from "../define.js";

// EDHREC rank 23116.
//
// Rulings:
//   [2011-01-01] If Sylvok Lifestaff and the equipped creature are put into their owners’
//     graveyards at the same time (due to Planar Cleansing, perhaps), the triggered ability will
//     still trigger. You’ll gain 3 life.

export default defineCard({
  name: "Sylvok Lifestaff",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0.\nWhenever equipped creature dies, you gain 3 life.\nEquip {1}",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "Whenever equipped creature dies, you gain 3 life.",
    },
  ],
});
