import { defineCard } from "../define.js";

// EDHREC rank 24775. Dúnedain Blade's two equip costs: the cheaper one only
// onto a Soldier creature you control.

export default defineCard({
  name: "Veteran's Powerblade",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0.\nEquip Soldier {W}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Soldier" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Soldier {W}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
