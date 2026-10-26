import { defineCard } from "../define.js";

const PUMP = "Equipped creature gets +1/+1.";
const VIGILANCE = "As long as equipped creature is a Human or an Angel, it has vigilance.";

export default defineCard({
  name: "Bladed Bracers",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${VIGILANCE}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
    { affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtypes: ["Human", "Angel"] } } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE,
    },
  ],
});
