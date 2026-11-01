import { defineCard } from "../define.js";

export default defineCard({
  name: "Hedron Matrix",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +X/+X, where X is its mana value.\nEquip {4}",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { ofAffected: "mana-value", pt: [1, 1] },
      text: "Equipped creature gets +X/+X, where X is its mana value.",
    },
  ],
});
