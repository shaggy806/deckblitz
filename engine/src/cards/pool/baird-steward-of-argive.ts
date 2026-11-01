import { defineCard } from "../define.js";

const TEXT = "Creatures can't attack you or planeswalkers you control unless their controller pays {1} for each of those creatures.";

export default defineCard({
  name: "Baird, Steward of Argive",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [{ affects: { scope: "self" }, attackTax: { generic: 1, covers: "you-and-planeswalkers" }, text: TEXT }],
});
