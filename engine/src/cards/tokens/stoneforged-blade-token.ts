import { defineCard } from "../define.js";

/** The colorless Equipment named Stoneforged Blade (Nahiri, the Lithomancer's
 * −10): indestructible, "Equipped creature gets +5/+5 and has double strike"
 * and equip {0}. Keyed " Token", named by `tokenName`. */
export default defineCard({
  name: "Stoneforged Blade Token",
  tokenName: "Stoneforged Blade",
  art: "a0f2a88f-ff00-4ef7-a9ed-e8457df2c9d3",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["indestructible"],
  text: "Indestructible\nEquipped creature gets +5/+5 and has double strike.\nEquip {0}",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {0}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [5, 5],
      grantKeywords: ["double-strike"],
      text: "Equipped creature gets +5/+5 and has double strike.",
    },
  ],
});
