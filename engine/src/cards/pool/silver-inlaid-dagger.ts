import { defineCard } from "../define.js";

// EDHREC rank 22342. True-Faith Censer's Human bonus.

export default defineCard({
  name: "Silver-Inlaid Dagger",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0.\nAs long as equipped creature is a Human, it gets an additional +1/+0.\nEquip {2}",
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
    { affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantPt: [1, 0],
      text: "As long as equipped creature is a Human, it gets an additional +1/+0.",
    },
  ],
});
