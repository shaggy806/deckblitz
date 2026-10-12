import { defineCard } from "../define.js";

export default defineCard({
  name: "Thunderhead Squadron",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying",
});
