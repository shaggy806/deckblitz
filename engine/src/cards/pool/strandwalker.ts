import { defineCard } from "../define.js";

export default defineCard({
  name: "Strandwalker",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\nEquipped creature gets +2/+4 and has reach.\nEquip {4}",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
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
      grantPt: [2, 4],
      grantKeywords: ["reach"],
      text: "Equipped creature gets +2/+4 and has reach.",
    },
  ],
});
