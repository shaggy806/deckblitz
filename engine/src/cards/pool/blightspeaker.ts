import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 24570.

const SEARCH_TEXT =
  "{4}, {T}: Search your library for a Rebel permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Blightspeaker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Cleric"],
  power: 1,
  toughness: 1,
  text: `{T}: Target player loses 1 life.\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: Target player loses 1 life.",
    },
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
      text: SEARCH_TEXT,
    },
  ],
});
