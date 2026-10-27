import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 29602. Blightspeaker's search, a Mercenary at
// mana value 2 or less; `min: 0` — the search may find nothing (the ruling).
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.

const TEXT =
  "{T}, Sacrifice a land: Search your library for a Mercenary permanent card with mana value 2 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Bog Glider",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
          manaValue: { op: "lte", n: 2 },
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
