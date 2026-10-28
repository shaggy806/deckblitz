import { defineCard } from "../define.js";

// EDHREC rank 23852.

export default defineCard({
  name: "Wall of Shields",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender", "banding"],
  text: "Defender (This creature can't attack.)\nBanding (If any creatures with banding you control are blocking a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by.)",
});
