import { defineCard } from "../define.js";

// The shuffle is its own replacement from every zone (`shufflesIntoLibraryInstead`).
const SHUFFLE_TEXT =
  "If Darksteel Colossus would be put into a graveyard from anywhere, reveal Darksteel Colossus and shuffle it into its owner's library instead.";

export default defineCard({
  name: "Darksteel Colossus",
  manaCost: "{11}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 11,
  toughness: 11,
  keywords: ["trample", "indestructible"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nIndestructible (Damage and effects that say "destroy" don't destroy this creature.)\n${SHUFFLE_TEXT}`,
  shufflesIntoLibraryInstead: true,
});
