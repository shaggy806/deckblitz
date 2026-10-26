import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 11136.

export default defineCard({
  name: "Cloak of Mists",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't be blocked.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["unblockable"], text: "Enchanted creature can't be blocked." },
  ],
});
