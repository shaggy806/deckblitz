import { defineCard } from "../define.js";

// EDHREC rank 22071.
//
// Rulings:
//   [2004-10-04] You do not have to find a Rebel card if you do not want to.
//   [2004-10-04] This card is both a Rebel and a Bird.

const SEARCH =
  "{4}, {T}: Search your library for a Rebel permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Defiant Falcon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rebel", "Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 3 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});
