import { defineCard } from "../define.js";

// EDHREC rank 16550.

export default defineCard({
  name: "The Black Arrow",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: "Flash\nWhen The Black Arrow enters, it deals 1 damage to any target. If a Dragon is dealt damage this way, destroy it.\nEquipped creature gets +1/+1 and has reach.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "damage-dealt-this-way", to: 0 },
                { kind: "target", index: 0, filter: { subtype: "Dragon" } },
              ],
            },
            then: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "When The Black Arrow enters, it deals 1 damage to any target. If a Dragon is dealt damage this way, destroy it.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["reach"],
      text: "Equipped creature gets +1/+1 and has reach.",
    },
  ],
});
