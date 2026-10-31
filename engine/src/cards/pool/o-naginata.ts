import { defineCard } from "../define.js";

const ONLY = "This Equipment can be attached only to a creature with power 3 or greater.";

export default defineCard({
  name: "O-Naginata",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ONLY}\nEquipped creature gets +3/+0 and has trample.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    { affects: { scope: "self" }, attachOnlyTo: { type: "creature", power: { op: "gte", n: 3 } }, text: ONLY },
    { affects: { scope: "attached" }, grantPt: [3, 0], grantKeywords: ["trample"], text: "Equipped creature gets +3/+0 and has trample." },
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
