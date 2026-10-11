import { defineCard } from "../define.js";

/** The colorless Equipment named Axe (Iron Hills Blacksmith, Dáin
 * Ironfoot): "Equipped creature gets +1/+0" and equip {2}. Keyed " Token",
 * named by `tokenName`. */
export default defineCard({
  name: "Axe Token",
  tokenName: "Axe",
  art: "6f7a3999-e341-43bb-9b8f-6c1a05b98906",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0.\nEquip {2}",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
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
});
