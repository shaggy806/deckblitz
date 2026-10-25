import { defineCard } from "../define.js";

// EDHREC rank 29114. Khans of Tarkir.

export default defineCard({
  name: "Sultai Scavenger",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  delve: true,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nFlying",
});
