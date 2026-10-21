import { defineCard } from "../define.js";

// EDHREC rank 14963.

const CAST_TEXT = "You may cast instant and sorcery spells from the top of your library.";
const EXILE_TEXT = "{3}: Exile the top card of your library.";

export default defineCard({
  name: "Precognition Field",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `You may look at the top card of your library any time.\n${CAST_TEXT}\n${EXILE_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { typesAnyOf: ["instant", "sorcery"] } },
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "exile-from-library", amount: 1 },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
