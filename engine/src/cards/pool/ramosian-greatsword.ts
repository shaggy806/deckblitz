import { defineCard } from "../define.js";

export default defineCard({
  name: "Ramosian Greatsword",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nEquipped creature gets +3/+1 and has trample.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
      grantPt: [3, 1],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +3/+1 and has trample.",
    },
  ],
});
