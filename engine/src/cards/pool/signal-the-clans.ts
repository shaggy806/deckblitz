import { defineCard } from "../define.js";

// EDHREC rank 10568.
//
// Rulings:
//   All players will see the card you put into your hand, if any.
//   If you don't reveal three creature cards with different names, you'll simply shuffle your
//     library (including any cards you revealed).
//
// The finds stay in the library, revealed; with three of different names one
// of them is picked at random (a random mode per find, as Wild Swing's) and
// put into the hand, and the search's shuffle takes the rest. Which three to
// reveal is the player's: two of a name is a legal reveal, and nothing then.

export default defineCard({
  name: "Signal the Clans",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Search your library for three creature cards and reveal them. If you reveal three cards with different names, choose one of them at random and put that card into your hand. Shuffle the rest into your library.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { type: "creature" },
    destination: "stay",
    reveal: true,
    min: 0,
    max: 3,
    then: {
      kind: "conditional",
      condition: {
        kind: "amounts",
        left: { aggregate: "distinct", of: "name", filter: {}, in: { thisWay: "revealed" } },
        op: "gte",
        right: 3,
      },
      then: {
        kind: "modal",
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [0, 1, 2].map((slot) => ({
          text: `Put revealed card ${slot + 1} into your hand`,
          effect: { kind: "return-to-hand" as const, target: slot, from: "library" as const },
        })),
      },
    },
  },
});
