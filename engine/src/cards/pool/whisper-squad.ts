import { defineCard } from "../define.js";

// EDHREC rank 31872. Ikoria: Lair of Behemoths.

const SEARCH_TEXT =
  "{1}{B}: Search your library for a card named Whisper Squad, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Whisper Squad",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: SEARCH_TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Whisper Squad" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
