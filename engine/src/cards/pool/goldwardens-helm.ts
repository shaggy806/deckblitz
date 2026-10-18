import { defineCard } from "../define.js";

// EDHREC rank 19119.
// Makes Rebel → use "Rebel Token".

export default defineCard({
  name: "Goldwarden's Helm",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "For Mirrodin! (When this Equipment enters, create a 2/2 red Rebel creature token, then attach this to it.)\nEquipped creature gets +0/+1.\nEquip {1}{W} ({1}{W}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}{W}",
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
  static: [{ affects: { scope: "attached" }, grantPt: [0, 1], text: "Equipped creature gets +0/+1." }],
});
