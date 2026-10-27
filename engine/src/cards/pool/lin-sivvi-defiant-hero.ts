import { defineCard } from "../define.js";

// EDHREC rank 19732.
//
// Rulings:
//   [2004-10-04] You do not have to find a Rebel card if you do not want to.

const SEARCH =
  "{X}, {T}: Search your library for a Rebel permanent card with mana value X or less, put it onto the battlefield, then shuffle.";
const BOTTOM = "{3}: Put target Rebel card from your graveyard on the bottom of your library.";

export default defineCard({
  name: "Lin Sivvi, Defiant Hero",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 3,
  text: `${SEARCH}\n${BOTTOM}`,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: "x" },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Rebel" } }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: BOTTOM,
    },
  ],
});
