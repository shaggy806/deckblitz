import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 14640. The target opponent's guess is theirs to answer yes or no;
// then you may reveal your hand whichever they said, and only a revealed hand
// showing the guess wrong draws (the rulings).
const TEXT =
  "{2}, {T}: Choose a card name. Target opponent guesses whether a card with that name is in your hand. You may reveal your hand. If you do and your opponent guessed wrong, draw a card.";

const HOLDS_NAME = { kind: "hand-size", atLeast: 1, filter: { hasName: CHOSEN_CARD_NAME } } as const;

export default defineCard({
  name: "Liar's Pendulum",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "for-each-player",
          who: { target: 0 },
          effect: {
            kind: "each-player-may",
            who: "that-player",
            prompt: "Guess whether a card with the chosen name is in that player's hand",
            choices: [
              {
                // Guessed yes: wrong if the hand doesn't hold it.
                text: "A card with that name is in their hand",
                effect: {
                  kind: "may",
                  prompt: "Reveal your hand? (They guessed a card with that name is in it.)",
                  effect: {
                    kind: "sequence",
                    effects: [
                      { kind: "reveal-hand", who: "you" },
                      {
                        kind: "conditional",
                        condition: { kind: "not", of: HOLDS_NAME },
                        then: { kind: "draw", amount: 1 },
                      },
                    ],
                  },
                },
              },
              {
                // Guessed no: wrong if the hand holds it.
                text: "No card with that name is in their hand",
                effect: {
                  kind: "may",
                  prompt: "Reveal your hand? (They guessed no card with that name is in it.)",
                  effect: {
                    kind: "sequence",
                    effects: [
                      { kind: "reveal-hand", who: "you" },
                      { kind: "conditional", condition: HOLDS_NAME, then: { kind: "draw", amount: 1 } },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
