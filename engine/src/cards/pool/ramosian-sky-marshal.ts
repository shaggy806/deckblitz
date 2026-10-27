import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26041. Amrou Scout's Rebel search; the
// search may find nothing (the ruling: `min: 0`).

const SEARCH =
  "{7}, {T}: Search your library for a Rebel permanent card with mana value 6 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Ramosian Sky Marshal",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{7}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 6 },
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
