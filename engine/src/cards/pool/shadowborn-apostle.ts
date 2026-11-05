import { defineCard } from "../define.js";

const SEARCH_TEXT =
  "{B}, Sacrifice six creatures named Shadowborn Apostle: Search your library for a Demon creature card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Shadowborn Apostle",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `A deck can have any number of cards named Shadowborn Apostle.\n${SEARCH_TEXT}`,
  deckCopies: "any",
  activated: [
    {
      cost: {
        mana: "{B}",
        tap: false,
        sacrifice: { filter: { type: "creature", name: "Shadowborn Apostle", controlledBy: "you" }, count: 6 },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", subtype: "Demon" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
