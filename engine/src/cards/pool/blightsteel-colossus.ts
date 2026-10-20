import { defineCard } from "../define.js";

// The shuffle is its own replacement from every zone (`shufflesIntoLibraryInstead`):
// destroyed it isn't (indestructible), but sacrificed, discarded, milled or
// countered it goes back into its owner's library, shuffled, never to a
// graveyard — ahead of Rest in Peace, as its owner would order them.
const SHUFFLE_TEXT =
  "If Blightsteel Colossus would be put into a graveyard from anywhere, reveal Blightsteel Colossus and shuffle it into its owner's library instead.";

export default defineCard({
  name: "Blightsteel Colossus",
  manaCost: "{12}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Golem"],
  power: 11,
  toughness: 11,
  keywords: ["trample", "infect", "indestructible"],
  text: `Trample, infect, indestructible\n${SHUFFLE_TEXT}`,
  shufflesIntoLibraryInstead: true,
});
