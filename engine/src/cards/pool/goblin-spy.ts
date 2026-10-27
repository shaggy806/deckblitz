import { defineCard } from "../define.js";

export default defineCard({
  name: "Goblin Spy",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  text: "Play with the top card of your library revealed.",
  revealsOwnLibraryTop: true,
});
