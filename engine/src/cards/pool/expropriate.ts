import { defineCard } from "../define.js";

// EDHREC rank 2519. Council's dilemma as Travel Through Caradhras writes it: the vote, then a
// `for-each-vote` per option in the order printed — an extra turn per time vote, then per money
// vote a permanent you choose among those the voter owns (`ownedByRef: "that-player"`, the voter),
// which you gain control of indefinitely. Exiled as it resolves.
//
// Rulings:
//   Each player must vote for one of the available options. They can't abstain.
//   Votes are cast in turn order, and each player will know the votes of players who voted
//     beforehand.
//   The effects of each council's dilemma ability happen in the stated order.

const TEXT =
  "Council's dilemma — Starting with you, each player votes for time or money. For each time vote, take an extra turn after this one. For each money vote, choose a permanent owned by the voter and gain control of it.";

export default defineCard({
  name: "Expropriate",
  manaCost: "{7}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${TEXT} Exile Expropriate.`,
  targets: [],
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["time", "money"] } },
      { kind: "for-each-vote", option: 0, effect: { kind: "take-extra-turn" } },
      {
        kind: "for-each-vote",
        option: 1,
        effect: {
          kind: "choose-permanents",
          filter: { ownedByRef: "that-player" },
          min: 1,
          upTo: 1,
          prompt: "Choose a permanent owned by the voter to gain control of",
          then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
        },
      },
    ],
  },
});
