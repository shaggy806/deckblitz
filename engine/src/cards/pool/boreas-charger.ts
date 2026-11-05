import { defineCard } from "../define.js";

// EDHREC rank 10007.
//
// Rulings:
//   [2018-07-13] You can find fewer Plains cards than the difference, perhaps because you don't
//     have that many Plains cards left in your library.
//   [2018-07-13] If no opponent controls more lands than you, you'll search your library and
//     shuffle it, but you won't be able to find any Plains cards.
//
// With no such opponent there is nobody to choose, and the search still happens, for nothing.

const TEXT =
  "When this creature leaves the battlefield, choose an opponent who controls more lands than you. Search your library for a number of Plains cards equal to the difference, reveal those cards, put one of them onto the battlefield tapped and the rest into your hand, then shuffle.";

export default defineCard({
  name: "Boreas Charger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "opponent-controls-more", filter: { type: "land" } },
        then: {
          kind: "choose-opponent",
          whoIf: {
            kind: "player-compare",
            stat: { controls: { type: "land" } },
            compare: "fewer",
            than: "that-player",
          },
          then: {
            kind: "search-library",
            filter: { subtype: "Plains" },
            min: 0,
            max: {
              difference: [
                { countOf: { type: "land", controlledBy: "you" }, forPlayer: "that-player" },
                { countOf: { type: "land", controlledBy: "you" } },
              ],
            },
            destination: "battlefield",
            enterTapped: true,
            restDestination: "hand",
            reveal: true,
          },
        },
        else: {
          kind: "search-library",
          filter: { subtype: "Plains" },
          min: 0,
          max: 0,
          destination: "battlefield",
          enterTapped: true,
          restDestination: "hand",
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
