import { defineCard } from "../define.js";

export default defineCard({
  name: "Disciple of Law",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  cycling: { cost: "{2}" },
  text: "Protection from red\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
