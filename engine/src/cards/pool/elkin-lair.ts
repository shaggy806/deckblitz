import { defineCard } from "../define.js";

// EDHREC rank 21685.
//
// "That player exiles" is the upkeep's player doing it (an `as-player` around
// the random pick and the exile), so the permission to play it this turn is
// theirs. The end step's trigger is the Lair's controller's (rule 603.7d),
// about the card exiled this way: a card played has left exile, a new object
// (rule 400.7), so "if the player hasn't played the card" is the card still
// being the one exiled, and `put-into-graveyard` acts only on that — into its
// owner's graveyard, the player's own.
const TEXT =
  "At the beginning of each player's upkeep, that player exiles a card at random from their hand. The player may play that card this turn. At the beginning of the next end step, if the player hasn't played the card, they put it into their graveyard.";
const LATER = "At the beginning of the next end step, if the player hasn't played the card, they put it into their graveyard.";

export default defineCard({
  name: "Elkin Lair",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "as-player",
            who: "active-player",
            effect: {
              kind: "choose-random-card",
              zone: "hand",
              then: {
                kind: "sequence",
                effects: [
                  { kind: "exile", target: 0, fromHand: true },
                  { kind: "grant-play", cards: 0, duration: "end-of-turn", play: true },
                ],
              },
            },
          },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "exiled",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "put-into-graveyard", target: 0 } },
            text: LATER,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
