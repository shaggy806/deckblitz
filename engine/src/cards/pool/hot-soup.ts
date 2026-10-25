import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 10029.

export default defineCard({
  name: "Hot Soup",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature can't be blocked.\nWhenever equipped creature is dealt damage, destroy it.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["unblockable"],
      text: "Equipped creature can't be blocked.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: "Whenever equipped creature is dealt damage, destroy it.",
    },
  ],
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
});
