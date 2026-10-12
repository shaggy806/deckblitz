import { defineCard } from "../define.js";

export default defineCard({
  name: "Rosemane Centaur",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nVigilance",
});
