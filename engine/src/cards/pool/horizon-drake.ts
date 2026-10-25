import { defineCard } from "../define.js";

// Protection from lands: no land creature blocks it, damage from lands is
// prevented, and no land's ability targets it (the ruling).
export default defineCard({
  name: "Horizon Drake",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying, protection from lands",
  static: [{ affects: { scope: "self" }, protection: { types: ["land"] }, text: "Protection from lands" }],
});
