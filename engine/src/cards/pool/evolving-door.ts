import { defineCard } from "../define.js";

const TEXT =
  "{1}, {T}, Sacrifice a creature: Count the colors of the sacrificed creature, then search your library for a creature card that's exactly that many colors plus one. Exile that card, then shuffle. You may cast the exiled card. Activate only as a sorcery.";

// The sacrificed creature's colors as it last existed on the battlefield
// (rule 608.2h); a colorless one asks for a monocolored card. The exiled card
// is cast as the ability resolves, paying its costs, or it stays in exile.
export default defineCard({
  name: "Evolving Door",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "creature-you-control" },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: {
              type: "creature",
              colorCount: { op: "eq", n: { amount: { sum: [{ colorsOf: { paid: "sacrificed" } }, 1] } } },
            },
            destination: "exile",
            min: 0,
            max: 1,
          },
          { kind: "cast-now", from: "exiled-this-way" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
