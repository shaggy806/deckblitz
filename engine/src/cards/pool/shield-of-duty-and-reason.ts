import { defineCard } from "../define.js";

// EDHREC rank 11056.

const TEXT = "Enchanted creature has protection from green and from blue.";

export default defineCard({
  name: "Shield of Duty and Reason",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, protection: { colors: ["G", "U"] }, text: TEXT }],
});
