import { defineCard } from "../define.js";

// EDHREC rank 21741.
// Makes Rebel → use "Rebel Token".

export default defineCard({
  name: "Sylvok Battle-Chair",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\nEquipped creature gets +4/+4 and has trample.\nEquip {5}{G}{G}",
  activated: [
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {5}{G}{G}",
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
      grantPt: [4, 4],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +4/+4 and has trample.",
    },
  ],
});
