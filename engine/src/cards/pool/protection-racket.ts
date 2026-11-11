import { defineCard } from "../define.js";

// EDHREC rank 7382.
// One opponent at a time, in turn order: a card is revealed, that opponent
// answers and the card goes to exile or your hand before the next card is
// revealed. The life is the revealed card's mana value (a land's is 0, and 0
// life can always be paid — rule 119.4b); a player with less life than that
// can't pay (rule 119.4).
const TEXT =
  "At the beginning of your upkeep, repeat the following process for each opponent in turn order. Reveal the top card of your library. That player may pay life equal to that card's mana value. If they do, exile that card. Otherwise, put it into your hand.";

export default defineCard({
  name: "Protection Racket",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "reveal-top",
          then: {
            kind: "each-player-may",
            who: "that-player",
            prompt: "Pay life equal to the revealed card's mana value to exile it? Otherwise it goes to its owner's hand.",
            options: [{ payLifeAmount: { manaValueOf: 0 }, text: "Pay {X} life" }],
            ifDid: { kind: "exile", target: 0 },
            ifDidnt: { kind: "return-to-hand", target: 0, from: "library" },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
