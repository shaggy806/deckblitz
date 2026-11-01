import { defineCard } from "../define.js";

// EDHREC rank 12629. "This creature and another green creature" is an `each`
// of two parts — the source (`isSource: true`, green or not: the ruling) and
// a green creature — every one a different permanent, sacrificed together as
// the cost is paid.

const TEXT =
  "{G}, {T}, Sacrifice this creature and another green creature: Search your library for a green creature card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Magus of the Order",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{G}",
        tap: true,
        sacrifice: { each: [{ isSource: true }, { type: "creature", colors: ["G"] }] },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", colors: ["G"] },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
