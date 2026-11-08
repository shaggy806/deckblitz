import { defineCard } from "../define.js";

// Counted as the ability resolves, and the search and shuffle happen with X 0
// (the rulings). "At least two more": that player's lands against yours plus two.
const TEXT =
  "{T}, Exile this artifact: Search your library for up to X basic land cards, where X is the number of players who control at least two more lands than you. Put those cards onto the battlefield, then shuffle.";

export default defineCard({
  name: "Surveyor's Scope",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: {
          countPlayers: "each-player",
          where: {
            kind: "amounts",
            left: { countOf: { type: "land", controlledBy: "you" }, forPlayer: "that-player" },
            op: "gte",
            right: { sum: [{ countOf: { type: "land", controlledBy: "you" } }, 2] },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
