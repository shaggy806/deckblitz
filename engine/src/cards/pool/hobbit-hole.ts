import { defineCard } from "../define.js";

// EDHREC rank 7301.
// Evolving Wilds' fetch, and Halflingcycling as typecycling (rule 702.29f —
// Generous Ent's "Forestcycling" shape): "a Halfling card" is any card with
// the creature type, so a changeling or a kindred Halfling is found too.

const FETCH_TEXT =
  "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Hobbit Hole",
  colors: [],
  types: ["land"],
  text: `${FETCH_TEXT}\nHalflingcycling {4} ({4}, Discard this card: Search your library for a Halfling card, reveal it, put it into your hand, then shuffle.)`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: FETCH_TEXT,
    },
  ],
  cycling: { cost: "{4}", search: { subtype: "Halfling" } },
});
