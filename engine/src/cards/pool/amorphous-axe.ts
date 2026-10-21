import { defineCard } from "../define.js";

const TEXT = "Equipped creature gets +3/+0 and is every creature type.";

export default defineCard({
  name: "Amorphous Axe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      grantPt: [3, 0],
      addSubtypes: ["(every creature type)"],
      text: TEXT,
    },
  ],
});
