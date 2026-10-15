import { defineCard } from "../define.js";

/** Origin of Captain America's colorless Equipment named Sturdy Shield:
 * "Equipped creature gets +1/+2" and equip {2}. Keyed " Token", named by
 * `tokenName`. */
export default defineCard({
  name: "Sturdy Shield Token",
  tokenName: "Sturdy Shield",
  art: "da23a10f-7ac6-4cdc-a35c-ef6bba6b6b6f",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+2.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
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
