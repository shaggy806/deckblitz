import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +2/+2 as long as it's an enchantment. Otherwise, it gets -2/-2.";

export default defineCard({
  name: "Nyx Infusion",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "enchantment" } } },
      grantPt: [2, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notTypes: ["enchantment"] } } },
      grantPt: [-2, -2],
      text: TEXT,
    },
  ],
});
