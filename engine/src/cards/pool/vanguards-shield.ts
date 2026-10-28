import { defineCard } from "../define.js";

// EDHREC rank 18596. Ruling (2012-05-01): block-additional abilities add up.

const STATIC_TEXT = "Equipped creature gets +0/+3 and can block an additional creature each combat.";

export default defineCard({
  name: "Vanguard's Shield",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      grantPt: [0, 3],
      blockAdditional: 1,
      text: STATIC_TEXT,
    },
  ],
});
