import { defineCard } from "../define.js";

// EDHREC rank 9391.
//
// The top card is public while this is out (rule 401.5); a creature spell
// cast from there keeps its timing and its costs (the rulings), and nothing
// else of the top card — cycling, its abilities — is offered, since it isn't
// in the hand. A land creature (Dryad Arbor) can't be cast, so isn't offered.
const CAST_TEXT = "You may cast creature spells from the top of your library.";

export default defineCard({
  name: "Garruk's Horde",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\nPlay with the top card of your library revealed.\n${CAST_TEXT} (Do this only any time you could cast that creature spell. You still pay the spell's costs.)`,
  revealsOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { type: "creature" } },
      text: CAST_TEXT,
    },
  ],
});
