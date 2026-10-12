import { defineCard } from "../define.js";

export default defineCard({
  name: "Ragged Short Spear",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, you may discard a card. If you do, draw two cards.\nEquipped creature gets +2/+0.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
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
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: "When this Equipment enters, you may discard a card. If you do, draw two cards.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
});
