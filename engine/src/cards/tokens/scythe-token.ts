import { defineCard } from "../define.js";

/** The Keeper of Four Scythes' colorless Equipment named Scythe: "Equipped
 * creature gets +1/+1" and equip {2}. Keyed " Token", named by `tokenName`.
 * No token printing (a playtest card's reminder text defines it). */
export default defineCard({
  name: "Scythe Token",
  tokenName: "Scythe",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1\nEquip {2}",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1" }],
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
