import { defineCard } from "../define.js";

// EDHREC rank 11092.
//
// "Seven or more lands and/or Treefolk" counts each permanent once, a land
// Treefolk included — one `anyOf` filter (Honored Dreyleader's shape). The
// count is taken after the fetched land has entered (Fabled Passage's "Then
// if you control four or more lands").
const TEXT =
  "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Then if you control seven or more lands and/or Treefolk, create a 3/4 green Treefolk creature token with reach. (It can block creatures with flying.)";

export default defineCard({
  name: "Tend the Sprigs",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { anyOf: [{ type: "land" }, { subtype: "Treefolk" }] },
          atLeast: 7,
        },
        then: { kind: "create-token", token: "Treefolk Token", count: 1 },
      },
    ],
  },
});
