import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] You may sacrifice the Herald itself to help pay for the cost of its ability.
//   [2008-10-01] To activate the ability, you must sacrifice three different creatures.

const TEXT =
  "{2}{B}, {T}, Sacrifice a blue creature, a black creature, and a red creature: Search your library for a card named Prince of Thralls, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Demon's Herald",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}{B}",
        tap: true,
        sacrifice: {
          each: [
            { type: "creature", colors: ["U"] },
            { type: "creature", colors: ["B"] },
            { type: "creature", colors: ["R"] },
          ],
        },
      },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { name: "Prince of Thralls" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
