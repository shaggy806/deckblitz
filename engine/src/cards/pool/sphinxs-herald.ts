import { defineCard } from "../define.js";

// EDHREC rank 28572. Shards of Alara.
//
// Three different creatures, one per colour (Viscerid Drone's `each` shape —
// each filter is its own permanent); the Herald itself may be one of them.
//
// Rulings:
//   [2008-10-01] To activate the ability, you must sacrifice three different creatures. You can't
//     sacrifice just one three-colored creature, for example.
//   [2008-10-01] You may sacrifice the Herald itself to help pay for the cost of its ability.

const TEXT =
  "{2}{U}, {T}, Sacrifice a white creature, a blue creature, and a black creature: Search your library for a card named Sphinx Sovereign, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Sphinx's Herald",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}{U}",
        tap: true,
        sacrifice: {
          each: [
            { type: "creature", colors: ["W"] },
            { type: "creature", colors: ["U"] },
            { type: "creature", colors: ["B"] },
          ],
        },
      },
      targets: [],
      effect: { kind: "search-library", filter: { name: "Sphinx Sovereign" }, destination: "battlefield", min: 0, max: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
