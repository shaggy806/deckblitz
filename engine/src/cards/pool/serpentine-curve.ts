import { defineCard } from "../define.js";

// EDHREC rank 18314.
//
// It isn't in your graveyard yet as X is read, and a face-down exiled card has
// no card type to match (the rulings).

export default defineCard({
  name: "Serpentine Curve",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is one plus the total number of instant and sorcery cards you own in exile and in your graveyard.",
  targets: [],
  effect: {
    kind: "create-token",
    token: "Fractal Token",
    count: 1,
    thenCounters: {
      kind: "+1/+1",
      amount: {
        sum: [
          1,
          {
            aggregate: "count",
            filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
            in: ["graveyards", "exile"],
          },
        ],
      },
    },
  },
});
