import { defineCard } from "../define.js";

// EDHREC rank 11495.
// Makes Rebel → use "Rebel Token".

export default defineCard({
  name: "Dragonwing Glider",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\nEquipped creature gets +2/+2 and has flying and haste.\nEquip {3}{R}{R}",
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}{R}{R}",
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
          { kind: "create-token", token: "Rebel Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "For Mirrodin!",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying", "haste"],
      text: "Equipped creature gets +2/+2 and has flying and haste.",
    },
  ],
});
