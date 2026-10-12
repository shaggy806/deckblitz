import { defineCard } from "../define.js";

export default defineCard({
  name: "Shivan Branch-Burner",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, haste",
});
