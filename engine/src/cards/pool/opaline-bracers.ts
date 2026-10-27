import { defineCard } from "../define.js";

// EDHREC rank 26202.

export default defineCard({
  name: "Opaline Bracers",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)\nEquipped creature gets +X/+X, where X is the number of charge counters on this Equipment.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", sunburst: true },
      text: "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
    },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "charge", pt: [1, 1] },
      text: "Equipped creature gets +X/+X, where X is the number of charge counters on this Equipment.",
    },
  ],
});
