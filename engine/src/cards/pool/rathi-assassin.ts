import { defineCard } from "../define.js";

// EDHREC rank 25188.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.

const DESTROY = "{1}{B}{B}, {T}: Destroy target tapped nonblack creature.";
const SEARCH =
  "{3}, {T}: Search your library for a Mercenary permanent card with mana value 3 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Rathi Assassin",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Mercenary", "Assassin"],
  power: 2,
  toughness: 2,
  text: `${DESTROY}\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{1}{B}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { tapped: true, notColors: ["B"], type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY,
    },
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
});
