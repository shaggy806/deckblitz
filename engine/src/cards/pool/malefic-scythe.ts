import { defineCard } from "../define.js";

export default defineCard({
  name: "Malefic Scythe",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "This Equipment enters with a soul counter on it.\nEquipped creature gets +1/+1 for each soul counter on this Equipment.\nWhenever equipped creature dies, put a soul counter on this Equipment.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "soul", amount: 1 },
      resolve: null,
      text: "Whenever equipped creature dies, put a soul counter on this Equipment.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "soul", amount: 1 } },
      text: "This Equipment enters with a soul counter on it.",
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "soul", pt: [1, 1] },
      text: "Equipped creature gets +1/+1 for each soul counter on this Equipment.",
    },
  ],
});
