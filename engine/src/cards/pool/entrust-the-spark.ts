import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 19371.
//
// "If you do" is the sacrifice having happened: answering yes with no
// planeswalker to sacrifice finds nothing (Academy Rector's shape).

const TEXT =
  "You may sacrifice a planeswalker. If you do, search your library for a planeswalker card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Entrust the Spark",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "may",
    prompt: "Sacrifice a planeswalker to search your library for a planeswalker card?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "sacrifice", who: "you", filter: { type: "planeswalker" }, count: 1 },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "sacrificed", who: "you" },
          then: {
            kind: "search-library",
            filter: { type: "planeswalker" },
            destination: "battlefield",
            min: 0,
            max: 1,
          },
        },
      ],
    },
  },
});
