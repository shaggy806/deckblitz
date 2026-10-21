import { defineCard } from "../define.js";

// EDHREC rank 10680.
//
// Rulings:
//   [2019-06-14] Dead of Winter affects only creatures that aren't snow creatures at the time it
//     resolves. Creatures that enter the battlefield later in the turn won't get -X/-X.
//   [2019-06-14] The value of X is determined only as Dead of Winter begins to resolve.

const MINUS_X = { product: [{ countOf: { supertype: "snow", controlledBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Dead of Winter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All nonsnow creatures get -X/-X until end of turn, where X is the number of snow permanents you control.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notSupertype: "snow" },
    power: MINUS_X,
    toughness: MINUS_X,
    duration: "end-of-turn",
  },
});
