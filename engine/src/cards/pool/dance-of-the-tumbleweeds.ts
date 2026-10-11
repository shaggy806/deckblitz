import { defineCard } from "../define.js";

// EDHREC rank 6833.
// Makes Elemental → new token "Elemental Token (Dance of the Tumbleweeds)".
//
// Spree (rule 702.172a), the modes in printed order, so a land the first mode
// finds is counted by the second (the ruling: always in the order written).
// "A basic land card or a Desert card" is one filter with an `anyOf` (Map
// the Frontier). X is the lands you control as the token is made (`basePt`,
// read once — the ruling).
const SEARCH_MODE =
  "+ {1} — Search your library for a basic land card or a Desert card, put it onto the battlefield, then shuffle.";
const TOKEN_MODE = "+ {3} — Create an X/X green Elemental creature token, where X is the number of lands you control.";
const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Dance of the Tumbleweeds",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Spree (Choose one or more additional costs.)\n${SEARCH_MODE}\n${TOKEN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: SEARCH_MODE,
        spreeCost: "{1}",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Desert" }] },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      {
        text: TOKEN_MODE,
        spreeCost: "{3}",
        effect: {
          kind: "create-token",
          token: "Elemental Token (Dance of the Tumbleweeds)",
          count: 1,
          basePt: { power: LANDS, toughness: LANDS },
        },
      },
    ],
  },
});
