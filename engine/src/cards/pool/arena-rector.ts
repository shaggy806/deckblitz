import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 8888.
//
// Rulings:
//   [2018-06-08] If Arena Rector leaves your graveyard before its triggered ability resolves,
//     perhaps because it's a token and ceased to exist, you can't exile it and won't be able to
//     search your library for a planeswalker card.
//
// Academy Rector's shape: the search waits on the exile having happened
// (`this-way` "exiled"), so a Rector gone from the graveyard finds nothing.

const TEXT =
  "When this creature dies, you may exile it. If you do, search your library for a planeswalker card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Arena Rector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Arena Rector to search your library for a planeswalker card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
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
      resolve: null,
      text: TEXT,
    },
  ],
});
