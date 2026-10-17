import { defineCard } from "../define.js";

// EDHREC rank 9856.
//
// "The vote is tied" only when more than one choice got the most votes (the
// ruling) — `vote-won`'s else. Each player picks up to two cards from their
// own graveyard, in turn order; then the spell exiles itself.

const TEXT =
  "Will of the council — Starting with you, each player votes for return or embark. If return gets more votes, each player returns up to two cards from their graveyard to their hand, then you exile Sail into the West. If embark gets more votes or the vote is tied, each player may discard their hand and draw seven cards.";

export default defineCard({
  name: "Sail into the West",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", for: { options: ["return", "embark"] } },
      {
        kind: "conditional",
        condition: { kind: "vote-won", option: 0 },
        then: {
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
                max: 2,
                destination: "hand",
                leftover: "stay",
              },
            },
            { kind: "exile", target: "source" },
          ],
        },
        else: {
          kind: "each-player-may",
          who: "each-player",
          prompt: "Discard your hand and draw seven cards?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard-hand", who: "you" },
              { kind: "draw", amount: 7 },
            ],
          },
        },
      },
    ],
  },
});
