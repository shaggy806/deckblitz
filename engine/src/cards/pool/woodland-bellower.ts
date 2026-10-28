import { defineCard } from "../define.js";

// EDHREC rank 6357.

export default defineCard({
  name: "Woodland Bellower",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 5,
  text: "When this creature enters, you may search your library for a nonlegendary green creature card with mana value 3 or less, put it onto the battlefield, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a nonlegendary green creature card with mana value 3 or less?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", colors: ["G"], notSupertype: "legendary", manaValue: { op: "lte", n: 3 } },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "When this creature enters, you may search your library for a nonlegendary green creature card with mana value 3 or less, put it onto the battlefield, then shuffle.",
    },
  ],
});
