import { defineCard } from "../define.js";

export default defineCard({
  name: "Civic Saber",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0 for each of its colors.\nEquip {1}",
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
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { ofAffected: "colors", pt: [1, 0] },
      text: "Equipped creature gets +1/+0 for each of its colors.",
    },
  ],
});
