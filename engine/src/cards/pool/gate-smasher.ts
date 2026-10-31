import { defineCard } from "../define.js";

const ONLY = "This Equipment can be attached only to a creature with toughness 4 or greater.";

export default defineCard({
  name: "Gate Smasher",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ONLY}\nEquipped creature gets +3/+0 and has trample.\nEquip {3}`,
  static: [
    { affects: { scope: "self" }, attachOnlyTo: { type: "creature", toughness: { op: "gte", n: 4 } }, text: ONLY },
    { affects: { scope: "attached" }, grantPt: [3, 0], grantKeywords: ["trample"], text: "Equipped creature gets +3/+0 and has trample." },
  ],
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
