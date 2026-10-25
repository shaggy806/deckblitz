import { defineCard } from "../define.js";

// EDHREC rank 19994.

export default defineCard({
  name: "Sphinx of Jwar Isle",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "shroud"],
  text: "Flying\nShroud (This creature can't be the target of spells or abilities.)\nYou may look at the top card of your library any time.",
  looksAtOwnLibraryTop: true,
});
