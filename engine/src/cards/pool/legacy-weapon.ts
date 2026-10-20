import { defineCard } from "../define.js";

// The shuffle is its own replacement from every zone (`shufflesIntoLibraryInstead`).
const EXILE_TEXT = "{W}{U}{B}{R}{G}: Exile target permanent.";
const SHUFFLE_TEXT =
  "If Legacy Weapon would be put into a graveyard from anywhere, reveal Legacy Weapon and shuffle it into its owner's library instead.";

export default defineCard({
  name: "Legacy Weapon",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${SHUFFLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: ["permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  shufflesIntoLibraryInstead: true,
});
