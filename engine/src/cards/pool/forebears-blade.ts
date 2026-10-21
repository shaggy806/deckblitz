import { defineCard } from "../define.js";

export default defineCard({
  name: "Forebear's Blade",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +3/+0 and has vigilance and trample.\nWhenever equipped creature dies, attach this Equipment to target creature you control.\nEquip {3}",
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
      trigger: { on: "dies", who: "attached" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Whenever equipped creature dies, attach this Equipment to target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      grantKeywords: ["vigilance", "trample"],
      text: "Equipped creature gets +3/+0 and has vigilance and trample.",
    },
  ],
});
