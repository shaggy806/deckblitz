import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 19318.
//
// Rulings:
//   [2011-01-22] The triggered ability checks whether the equipped creature as it last existed on
//     the battlefield was a Human.
//
// Slayer's Plate's trigger: the dies filter reads the creature as it last
// existed (rule 603.10a).

export default defineCard({
  name: "Avacyn's Collar",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0 and has vigilance.\nWhenever equipped creature dies, if it was a Human, create a 1/1 white Spirit creature token with flying.\nEquip {2}",
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
  triggered: [
    {
      trigger: { on: "dies", who: "attached", filter: { subtype: "Human" } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: "Whenever equipped creature dies, if it was a Human, create a 1/1 white Spirit creature token with flying.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["vigilance"],
      text: "Equipped creature gets +1/+0 and has vigilance.",
    },
  ],
});
