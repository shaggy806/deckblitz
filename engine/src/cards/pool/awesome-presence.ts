import { defineCard } from "../define.js";

const TEXT = "Enchanted creature can't be blocked unless defending player pays {3} for each creature they control that's blocking it.";

// A cost to block (rule 509.1d) carried by the attacker: whoever blocks it pays.
export default defineCard({
  name: "Awesome Presence",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, combatTax: { on: ["be-blocked"], generic: 3 }, text: TEXT }],
});
