import { defineCard } from "../define.js";

// Playtest card.

export default defineCard({
  name: "Phyrexian Ornithopter",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  toxic: 1,
  text: "Flying, toxic 1",
});
