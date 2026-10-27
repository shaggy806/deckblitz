import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 29609.

const TEXT = "Enchanted creature gets +3/+3 as long as it's a Zombie. Otherwise, it gets -3/-3.";

export default defineCard({
  name: "Clutch of Undeath",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Zombie" } } },
      grantPt: [3, 3],
      text: TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { notSubtypes: ["Zombie"] } } },
      grantPt: [-3, -3],
      text: TEXT,
    },
  ],
});
