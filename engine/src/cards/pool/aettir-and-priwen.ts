import { defineCard } from "../define.js";

// EDHREC rank 2672.

export default defineCard({
  name: "Aettir and Priwen",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has base power and toughness X/X, where X is your life total.\nEquip {5}",
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {5}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      setBasePtFromSourceCount: "your-life-total",
      text: "Equipped creature has base power and toughness X/X, where X is your life total.",
    },
  ],
});
