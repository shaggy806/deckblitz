import { defineCard } from "../define.js";

export default defineCard({
  name: "Sun-Dappled Celebrant",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Treefolk", "Cleric"],
  power: 5,
  toughness: 6,
  keywords: ["vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nVigilance",
});
