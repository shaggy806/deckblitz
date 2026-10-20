import { defineCard } from "../define.js";

// EDHREC rank 13555.

export default defineCard({
  name: "Ancestral Katana",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Whenever a Samurai or Warrior you control attacks alone, you may pay {1}. When you do, attach this Equipment to it.\nEquipped creature gets +2/+1.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
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
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: "Equipped creature gets +2/+1." }],
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control", filter: { subtypes: ["Samurai", "Warrior"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to attach Ancestral Katana to it?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "attach", target: "trigger-object" },
          text: "When you do, attach this Equipment to it.",
        },
      },
      resolve: null,
      text: "Whenever a Samurai or Warrior you control attacks alone, you may pay {1}. When you do, attach this Equipment to it.",
    },
  ],
});
