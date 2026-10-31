import { defineCard } from "../define.js";

const TEXT =
  "{2}, {T}, Sacrifice a creature: Search your library for a creature card that shares a creature type with the sacrificed creature and has mana value equal to 1 plus that creature's mana value. Put that card onto the battlefield, then shuffle. Activate only as a sorcery.";

// Birthing Pod's shape with the sacrificed creature's creature types.
export default defineCard({
  name: "Pyre of Heroes",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "creature-you-control" },
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "creature",
          sharesCreatureTypeWith: "sacrificed",
          manaValue: { op: "eq", n: { amount: { sum: [{ manaValueOf: "sacrificed" }, 1] } } },
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
