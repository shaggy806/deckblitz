import { defineCard } from "../define.js";

export default defineCard({
  name: "Magebane Armor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+4 and loses flying.\nPrevent all noncombat damage that would be dealt to equipped creature.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 4],
      loseKeywords: ["flying"],
      text: "Equipped creature gets +2/+4 and loses flying.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "attached", combat: false, prevent: true },
      text: "Prevent all noncombat damage that would be dealt to equipped creature.",
    },
  ],
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
