import { defineCard } from "../define.js";

export default defineCard({
  name: "Siege Wurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTrample",
});
