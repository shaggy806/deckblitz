import { defineCard } from "../define.js";

// Judgment. An `unless` whose way out is any effect the chooser does (`doing`):
// a player with an empty graveyard can still choose it, there being nothing it
// asks that they can't do, and then the spell isn't countered.

export default defineCard({
  name: "Grip of Amnesia",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller exiles all cards from their graveyard.\nDraw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "unless",
        chooser: 0,
        options: [
          {
            doing: { kind: "exile-graveyard", target: "you" },
            text: "Exile all cards from your graveyard",
          },
        ],
        otherwise: { kind: "counter", target: 0 },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
