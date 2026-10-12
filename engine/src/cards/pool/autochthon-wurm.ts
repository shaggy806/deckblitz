import { defineCard } from "../define.js";

export default defineCard({
  name: "Autochthon Wurm",
  manaCost: "{10}{G}{G}{G}{W}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 9,
  toughness: 14,
  keywords: ["trample"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nTrample",
});
