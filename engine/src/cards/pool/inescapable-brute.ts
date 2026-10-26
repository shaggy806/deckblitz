import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 29011.

const TEXT = "This creature must be blocked if able.";

export default defineCard({
  name: "Inescapable Brute",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["wither"],
  text: `Wither (This deals damage to creatures in the form of -1/-1 counters.)\n${TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked-if-able"], text: TEXT }],
});
