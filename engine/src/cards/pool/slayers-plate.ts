import { defineCard } from "../define.js";

// "If it was a Human": the dies trigger's filter reads the creature as it
// last existed on the battlefield (rule 603.10a), both as it triggers and as
// it resolves.

export default defineCard({
  name: "Slayer's Plate",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +4/+2.\nWhenever equipped creature dies, if it was a Human, create a 1/1 white Spirit creature token with flying.\nEquip {3}",
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
      trigger: { on: "dies", who: "attached", filter: { subtype: "Human" } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: "Whenever equipped creature dies, if it was a Human, create a 1/1 white Spirit creature token with flying.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 2], text: "Equipped creature gets +4/+2." }],
});
