import { defineCard } from "../define.js";

export default defineCard({
  name: "Flight of Equenauts",
  manaCost: "{7}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying",
});
