import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25099. Amrou Scout's Rebel search; the
// search may find nothing (the ruling: `min: 0`).

const SEARCH =
  "{6}, {T}: Search your library for a Rebel permanent card with mana value 5 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Ramosian Commander",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 4,
  text: SEARCH,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 5 },
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
