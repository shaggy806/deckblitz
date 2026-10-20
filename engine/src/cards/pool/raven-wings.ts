import { defineCard } from "../define.js";

export default defineCard({
  name: "Raven Wings",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0, has flying, and is a Bird in addition to its other types.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      addSubtypes: ["Bird"],
      text: "Equipped creature gets +1/+0, has flying, and is a Bird in addition to its other types.",
    },
  ],
});
