import { defineCard } from "../define.js";

const TEXT = "Converge — Search your library for a creature, instant, or sorcery card with mana value less than or equal to the number of colors of mana spent to cast this spell, exile that card, then shuffle. You may cast that card without paying its mana cost.";

export default defineCard({
  name: "Bring to Light",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: {
          typesAnyOf: ["creature", "instant", "sorcery"],
          manaValue: { op: "lte", n: { amount: { manaSpentOf: "source", count: "colors" } } },
        },
        destination: "exile",
        min: 0,
        max: 1,
      },
      { kind: "cast-now", from: "exiled-this-way", free: true },
    ],
  },
});
