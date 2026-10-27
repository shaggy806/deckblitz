import { defineCard } from "../define.js";

// Rulings:
//   Because the "search" requires you to find a card with certain
//     characteristics, you don't have to find the card if you don't want to.

const TEXT =
  "{4}, {T}: Search your library for a Rebel permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Ramosian Lieutenant",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 2,
  text: TEXT,
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
      text: TEXT,
    },
  ],
});
