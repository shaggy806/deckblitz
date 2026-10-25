import { defineCard } from "../define.js";

// EDHREC rank 27554.

export default defineCard({
  name: "Shambling Attendants",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 5,
  keywords: ["deathtouch"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nDeathtouch (Any amount of damage this deals to a creature is enough to destroy it.)",
});
