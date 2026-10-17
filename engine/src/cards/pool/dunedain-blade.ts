import { defineCard } from "../define.js";

// EDHREC rank 16661.

export default defineCard({
  name: "Dúnedain Blade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+1.\nEquip Human {1}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Human" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Human {1}",
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
});
