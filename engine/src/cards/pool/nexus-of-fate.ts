import { defineCard } from "../define.js";

// Resolved or countered, it's shuffled back into its owner's library instead
// of going to the graveyard (`shufflesIntoLibraryInstead`), so it can come
// round again; a discard or mill shuffles it in too.
const SHUFFLE_TEXT =
  "If Nexus of Fate would be put into a graveyard from anywhere, reveal Nexus of Fate and shuffle it into its owner's library instead.";

export default defineCard({
  name: "Nexus of Fate",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Take an extra turn after this one.\n${SHUFFLE_TEXT}`,
  effect: { kind: "take-extra-turn" },
  shufflesIntoLibraryInstead: true,
});
