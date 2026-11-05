import { defineCard } from "../define.js";

const SEARCH_TEXT =
  "{W}, Tap five untapped attacking creatures you control named Templar Knight: Search your library for a legendary artifact card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Templar Knight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${SEARCH_TEXT}\nA deck can have any number of cards named Templar Knight.`,
  deckCopies: "any",
  activated: [
    {
      cost: {
        mana: "{W}",
        tap: false,
        tapOthers: {
          count: 5,
          filter: { type: "creature", name: "Templar Knight", controlledBy: "you", attacking: true },
          includeSelf: true,
        },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact", supertype: "legendary" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
