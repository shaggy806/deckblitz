import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 28008.
//
// Rulings:
//   - Because the "search" requires you to find a card with certain characteristics, you don't
//     have to find the card if you don't want to.
//
// Blightspeaker's search, for a Mercenary.

const ENTERS = "When this creature enters, each player loses 3 life.";
const SEARCH =
  "{3}, {T}: Search your library for a Mercenary permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Rathi Fiend",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror", "Mercenary"],
  power: 2,
  toughness: 2,
  text: `${ENTERS}\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
          manaValue: { op: "lte", n: 3 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "each-player" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
