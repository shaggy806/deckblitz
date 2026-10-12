import { defineCard } from "../define.js";

export default defineCard({
  name: "Halo Hopper",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Frog"],
  power: 3,
  toughness: 2,
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)",
});
