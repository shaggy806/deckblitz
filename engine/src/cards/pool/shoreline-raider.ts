import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 32004. Dragonstalker's protection from a
// creature type.
export default defineCard({
  name: "Shoreline Raider",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 2,
  text: "Protection from Kavu",
  static: [{ affects: { scope: "self" }, protection: { filter: { subtype: "Kavu" } }, text: "Protection from Kavu" }],
});
