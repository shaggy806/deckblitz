import { defineCard } from "../define.js";

export default defineCard({
  name: "Peregrine Mask",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has defender, flying, and first strike.\nEquip {2}",
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["defender", "flying", "first-strike"],
      text: "Equipped creature has defender, flying, and first strike.",
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
