import { defineCard } from "../define.js";

export default defineCard({
  name: "Colossal Dreadmask",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\nEquipped creature gets +6/+6 and has trample.\nEquip {3}{G}{G}",
  activated: [
    {
      cost: { mana: "{3}{G}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}{G}{G}",
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
      grantPt: [6, 6],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +6/+6 and has trample.",
    },
  ],
});
