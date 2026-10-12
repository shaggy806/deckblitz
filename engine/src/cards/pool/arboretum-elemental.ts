import { defineCard } from "../define.js";

export default defineCard({
  name: "Arboretum Elemental",
  manaCost: "{7}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 5,
  keywords: ["hexproof"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nHexproof (This creature can't be the target of spells or abilities your opponents control.)",
});
