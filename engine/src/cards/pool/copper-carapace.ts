import { defineCard } from "../define.js";

export default defineCard({
  name: "Copper Carapace",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+2 and can't block.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: "Equipped creature gets +2/+2 and can't block.",
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
