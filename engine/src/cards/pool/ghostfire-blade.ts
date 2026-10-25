import { defineCard } from "../define.js";

// EDHREC rank 20308. The equip reduction is the ability's
// `targetCostReduction` (Raft Security Officer's); a face-down creature is
// colorless (the ruling).

export default defineCard({
  name: "Ghostfire Blade",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+2.\nEquip {3}\nThis Equipment's equip ability costs {2} less to activate if it targets a colorless creature.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      targetCostReduction: { filter: { type: "creature", colorless: true }, reduceGeneric: 2 },
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
});
