import { defineCard } from "../define.js";

export default defineCard({
  name: "Skinwing",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\nEquipped creature gets +2/+2 and has flying.\nEquip {6}",
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {6}",
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
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Equipped creature gets +2/+2 and has flying.",
    },
  ],
});
