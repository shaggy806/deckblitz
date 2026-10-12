import { defineCard } from "../define.js";

export default defineCard({
  name: "Defender of Law",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nProtection from red",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
