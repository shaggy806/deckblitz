import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] You may sacrifice the Herald itself to help pay for the cost of its ability.
//   [2008-10-01] To activate the ability, you must sacrifice three different creatures.

const TEXT =
  "{2}{W}, {T}, Sacrifice a green creature, a white creature, and a blue creature: Search your library for a card named Empyrial Archangel, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Angel's Herald",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}{W}",
        tap: true,
        sacrifice: {
          each: [
            { type: "creature", colors: ["G"] },
            { type: "creature", colors: ["W"] },
            { type: "creature", colors: ["U"] },
          ],
        },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Empyrial Archangel" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
