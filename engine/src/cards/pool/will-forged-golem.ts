import { defineCard } from "../define.js";

export default defineCard({
  name: "Will-Forged Golem",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)",
});
