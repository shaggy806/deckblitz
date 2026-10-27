import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 25317.

const TEXT = "Equipped creature gets +4/+2 and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Vulshok Gauntlets",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [4, 2], restrictions: ["doesnt-untap"], text: TEXT }],
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
});
