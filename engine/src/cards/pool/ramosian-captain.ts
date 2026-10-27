import { defineCard } from "../define.js";

// EDHREC rank 23580. A Rebel searcher (Blightspeaker's
// shape); you needn't find one (its ruling).

const TEXT =
  "{5}, {T}: Search your library for a Rebel permanent card with mana value 4 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Ramosian Captain",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      resolve: null,
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 4 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      text: TEXT,
    },
  ],
});
