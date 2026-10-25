import { defineCard } from "../define.js";

export default defineCard({
  name: "Gurmag Angler",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Fish"],
  power: 5,
  toughness: 5,
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)",
  delve: true,
});
