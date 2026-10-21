import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +0/+2 as long as it's a Pirate. Otherwise, it gets -2/-0.";

export default defineCard({
  name: "Sea Legs",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Pirate" } } },
      grantPt: [0, 2],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notSubtypes: ["Pirate"] } } },
      grantPt: [-2, 0],
      text: TEXT,
    },
  ],
});
