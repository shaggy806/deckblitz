import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 7637.
//
// "Put one of them into your hand and the rest on top of your library in any
// order": the card taken leaves the other four as the library's top four, so
// the second look-and-choose is Ponder's "put them back in any order" over
// exactly those cards (every one taken, the first on top).

const TEXT =
  "Look at the top five cards of your library. Put one of them into your hand and the rest on top of your library in any order.";

export default defineCard({
  name: "Diabolic Vision",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 5, min: 1, max: 1, destination: "hand", leftover: "stay" },
      { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
    ],
  },
});
