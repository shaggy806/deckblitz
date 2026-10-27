import { defineCard } from "../define.js";

// EDHREC rank 24125.
// Each player, in turn order from the active player (rule 101.4), may exile
// any number of cards from their own graveyard; `max` is every card in every
// graveyard, an upper bound no graveyard can exceed, so "any number" is the
// whole of theirs. Then the life loss reads each player's own graveyard.

export default defineCard({
  name: "Grave Consequences",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Each player may exile any number of cards from their graveyard. Then each player loses 1 life for each card in their graveyard.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          zone: "graveyard",
          player: "that-player",
          min: 0,
          max: { countInGraveyard: {} },
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      { kind: "lose-life", who: "each-player", amount: { graveyardSize: "each" } },
      { kind: "draw", amount: 1 },
    ],
  },
});
