import { defineCard } from "../define.js";

// EDHREC rank 4284.
//
// Rulings:
//   [2021-11-19] Starting with the player whose turn it is, each player chooses a nonland
//     permanent they control. Players get to know what permanents have been chose by players that
//     chose before them as they make their choice. Then all nonland permanents that weren't chosen
//     by any player are returned to their owners' hands at the same time.

export default defineCard({
  name: "Consuming Tide",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player chooses a nonland permanent they control. Return all nonland permanents not chosen this way to their owners' hands. Then you draw a card for each opponent who has more cards in their hand than you.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        startingWith: "active-player",
        for: { permanent: { notTypes: ["land"], controlledBy: "you" }, own: true, keep: true },
      },
      { kind: "return-to-hand-all", filter: { notTypes: ["land"], notThisWay: "chosen" } },
      {
        kind: "draw",
        amount: {
          countPlayers: "each-opponent",
          where: { kind: "player-compare", stat: "hand", compare: "fewer", than: "that-player" },
        },
      },
    ],
  },
});
