import { defineCard } from "../define.js";

const REGEN = "Sacrifice a creature: Regenerate this creature.";
const SEARCH =
  "{6}, {T}: Search your library for a Mercenary permanent card with mana value 6 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Cateran Overlord",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror", "Mercenary"],
  power: 7,
  toughness: 5,
  text: `${REGEN}\n${SEARCH}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
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
