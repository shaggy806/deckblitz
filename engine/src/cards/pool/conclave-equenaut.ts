import { defineCard } from "../define.js";

export default defineCard({
  name: "Conclave Equenaut",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying",
});
