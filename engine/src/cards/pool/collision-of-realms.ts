import { defineCard } from "../define.js";

// EDHREC rank 16401.
//
// Rulings:
//   [2022-02-18] Each player reveals and puts onto the battlefield one creature card or fewer.
//     They don't reveal a card for each nontoken creature they shuffle into their library; it's
//     just one creature card at most.
//   [2022-02-18] All creatures are shuffled into their owners' libraries at the same time. Then
//     all players who shuffled nontoken creatures into their library this way reveal cards. Then
//     all creature cards revealed this way enter the battlefield at the same time. Then all other
//     cards are put on the bottom of their owners' libraries. … A player who controls no
//     creatures or who controls only creature tokens will still shuffle their library.
//
// Every creature into its owner's library in one move, each library shuffled
// (`shuffle-graveyard-into-library` of `"permanents"` with a filter). The
// players who shuffled in a nontoken creature (`whoseAmount`, a token still in
// the library until the next state-based check, rule 111.7) each reveal until
// one creature card; the finds are held (`choicesHeld`, rule 101.4) and enter
// together, each under its owner's control, and each player's other revealed
// cards go to the bottom of their library in a random order.
const TEXT =
  "Each player shuffles all creatures they own into their library. Each player who shuffled a nontoken creature into their library this way reveals cards from the top of their library until they reveal a creature card, then puts that card onto the battlefield and the rest on the bottom of their library in a random order.";

export default defineCard({
  name: "Collision of Realms",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "shuffle-graveyard-into-library",
        target: "each-player",
        zones: ["permanents"],
        filter: { type: "creature" },
      },
      {
        kind: "for-each-player",
        who: "each-player",
        whoseAmount: { thisWay: "shuffled-into-library", who: "each", filter: { token: false } },
        choicesHeld: true,
        effect: {
          kind: "reveal-until-count",
          whose: "that-player",
          filter: { type: "creature" },
          count: 1,
          put: "battlefield",
          rest: "bottom-random",
        },
      },
    ],
  },
});
