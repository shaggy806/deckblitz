import { defineCard } from "../define.js";

// Protection from everything is a protection with an empty filter (rule
// 702.16e). The shuffle is its own replacement from every zone
// (`shufflesIntoLibraryInstead`); as a commander, on its way into the library
// its owner may still put it into the command zone instead (903.9b).
const SHUFFLE_TEXT =
  "If Progenitus would be put into a graveyard from anywhere, reveal Progenitus and shuffle it into its owner's library instead.";

export default defineCard({
  name: "Progenitus",
  manaCost: "{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hydra", "Avatar"],
  power: 10,
  toughness: 10,
  text: `Protection from everything\n${SHUFFLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: {} },
      text: "Protection from everything",
    },
  ],
  shufflesIntoLibraryInstead: true,
});
