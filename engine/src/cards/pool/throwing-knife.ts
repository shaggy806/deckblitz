import { defineCard } from "../define.js";

// EDHREC rank 27379.
// Ruling: Throwing Knife is the source of the damage.

export default defineCard({
  name: "Throwing Knife",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0.\nWhenever equipped creature attacks, you may sacrifice this Equipment. If you do, this Equipment deals 2 damage to any target.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
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
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Throwing Knife to deal 2 damage to the target?",
        effect: { kind: "sacrifice-source", then: { kind: "damage", amount: 2, target: 0 } },
      },
      resolve: null,
      text: "Whenever equipped creature attacks, you may sacrifice this Equipment. If you do, this Equipment deals 2 damage to any target.",
    },
  ],
});
