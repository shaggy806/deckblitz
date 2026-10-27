import { defineCard } from "../define.js";

// EDHREC rank 18181.

export default defineCard({
  name: "Beloved Chaplain",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Protection from creatures",
  static: [{ affects: { scope: "self" }, protection: { types: ["creature"] }, text: "Protection from creatures" }],
});
