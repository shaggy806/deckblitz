import { defineCard } from "../define.js";

// EDHREC rank 4785.
// Rulings:
//   Attacking a planeswalker you control or battle you're protecting doesn't count as attacking
//     you.
//
// The delayed ability keeps its creator's "that player" (the chosen opponent)
// and waits for that player's next end step; "that turn" is then the turn under
// way, their most recent, read by `attacked-you-last-turn` from the attacks
// recorded as they were declared (an attacker that has since left still counts).

const TEXT =
  "At the beginning of your end step, choose an opponent. At the beginning of that player's next end step, you draw a card if they didn't attack you that turn. Otherwise, create three 1/1 white Human Soldier creature tokens.";

export default defineCard({
  name: "Faramir, Prince of Ithilien",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        then: {
          kind: "delayed-trigger",
          at: { step: "end", whose: "that-player" },
          effect: {
            kind: "conditional",
            condition: { kind: "attacked-you-last-turn", by: "that-player" },
            then: { kind: "create-token", token: "Human Soldier Token", count: 3 },
            else: { kind: "draw", amount: 1 },
          },
          text: "You draw a card if that player didn't attack you this turn. Otherwise, create three 1/1 white Human Soldier creature tokens.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
