import { defineCard } from "../define.js";

export default defineCard({
  name: "Manaforce Mace",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Domain — Equipped creature gets +1/+1 for each basic land type among lands you control.\nEquip {3}",
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
    {
      affects: { scope: "attached" },
      grantPtPerCount: { basicLandTypes: true, pt: [1, 1] },
      text: "Domain — Equipped creature gets +1/+1 for each basic land type among lands you control.",
    },
  ],
});
