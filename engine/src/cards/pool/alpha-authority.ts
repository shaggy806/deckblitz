import { defineCard } from "../define.js";

// EDHREC rank 3147.

const TEXT = "Enchanted creature has hexproof and can't be blocked by more than one creature.";

export default defineCard({
  name: "Alpha Authority",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["hexproof"], blockedByAtMostOne: true, text: TEXT }],
});
