import { defineCard } from "../define.js";

export default defineCard({
  name: "Guardian of Vitu-Ghazi",
  manaCost: "{6}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 7,
  keywords: ["vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nVigilance",
});
