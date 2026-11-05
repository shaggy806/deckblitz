import { defineCard } from "../define.js";

// EDHREC rank 7613.
//
// No intervening "if": the ability always triggers and the token is the conditional's. Each opponent
// who lost 3 or more life faces the choice in turn, and it's done before the next is asked (the
// rulings), as The Dalek Emperor's.

const TEXT =
  "At the beginning of your end step, create a 3/3 black Dalek artifact creature token with menace if an opponent lost 3 or more life this turn. Then each opponent who lost 3 or more life this turn faces a villainous choice — You draw a card, or that player discards a card.";

export default defineCard({
  name: "Davros, Dalek Creator",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Alien", "Scientist"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 3 },
            then: { kind: "create-token", token: "Dalek Token", count: 1 },
          },
          {
            kind: "for-each-player",
            who: "each-opponent",
            whoIf: {
              kind: "of-player",
              player: "that-player",
              condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 3 },
            },
            effect: {
              kind: "each-player-may",
              who: "that-player",
              choices: [
                { text: "You draw a card.", effect: { kind: "draw", amount: 1 } },
                { text: "That player discards a card.", effect: { kind: "discard", target: "that-player", amount: 1 } },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
