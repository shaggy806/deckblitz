import { defineCard } from "../define.js";

export default defineCard({
  name: "Butcher's Cleaver",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +3/+0.\nAs long as equipped creature is a Human, it has lifelink.\nEquip {3}",
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
    { affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantKeywords: ["lifelink"],
      text: "As long as equipped creature is a Human, it has lifelink.",
    },
  ],
});
