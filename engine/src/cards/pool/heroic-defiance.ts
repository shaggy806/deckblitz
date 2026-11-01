import { defineCard } from "../define.js";

// Whether the enchanted creature has a most common color (`most-common-color`'s
// `sharedBy: "attached"`), this Aura counted among all permanents.

const TEXT = "Enchanted creature gets +3/+3 unless it shares a color with the most common color among all permanents or a color tied for most common.";

export default defineCard({
  name: "Heroic Defiance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "most-common-color", sharedBy: "attached" } },
      grantPt: [3, 3],
      text: TEXT,
    },
  ],
});
