import { defineCard } from "../define.js";

// EDHREC rank 7345.

export default defineCard({
  name: "Golem-Skin Gauntlets",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0 for each Equipment attached to it.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { subtype: "Equipment", attachedTo: { isSource: true } },
        relativeToAffected: true,
        pt: [1, 0],
      },
      text: "Equipped creature gets +1/+0 for each Equipment attached to it.",
    },
  ],
});
