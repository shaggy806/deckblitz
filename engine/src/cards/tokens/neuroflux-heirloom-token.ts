import { defineCard } from "../define.js";

/** A colorless Equipment artifact token named Neuroflux Heirloom: "Equipped
 * creature gets +1/+1" and equip {2}. Keyed " Token", named by `tokenName`. */
export default defineCard({
  name: "Neuroflux Heirloom Token",
  tokenName: "Neuroflux Heirloom",
  art: "d811c3c3-6b5b-4b42-be4f-0a455313ccd3",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
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
