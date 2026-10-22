import { defineCard } from "../define.js";

// Rasputin, the Oneiromancer's Knight token.

export default defineCard({
  name: "Knight Token (Rasputin, the Oneiromancer)",
  art: "19e893e5-12a8-4ecb-adcd-9e7b26b01de2",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Knight"],
  power: 2,
  toughness: 2,
  text: "Protection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
