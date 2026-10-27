import { defineCard } from "../define.js";

// EDHREC rank 1678.
// Makes Phyrexian Germ → use "Phyrexian Germ Token".

export default defineCard({
  name: "Kaldra Compleat",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["indestructible"],
  text: "Living weapon\nIndestructible\nEquipped creature gets +5/+5 and has first strike, trample, indestructible, haste, and \"Whenever this creature deals combat damage to a creature, exile that creature.\"\nEquip {7}",
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {7}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Phyrexian Germ Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [5, 5],
      grantKeywords: ["first-strike", "trample", "indestructible", "haste"],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
          targets: [],
          effect: { kind: "exile", target: "trigger-recipient" },
          resolve: null,
          text: "Whenever this creature deals combat damage to a creature, exile that creature.",
        },
      ],
      text: 'Equipped creature gets +5/+5 and has first strike, trample, indestructible, haste, and "Whenever this creature deals combat damage to a creature, exile that creature."',
    },
  ],
});
