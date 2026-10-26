import { defineCard } from "../define.js";

// EDHREC rank 18723.

const TEXT = "Enchanted creature gets +2/+0 and can't be blocked.";

export default defineCard({
  name: "Tricks of the Trade",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], grantKeywords: ["unblockable"], text: TEXT }],
});
