import { defineCard } from "../define.js";

// EDHREC rank 4370. The first ability is Banon's: paying {1} and discarding
// are one "if you do". The second triggers once for a discard of any number
// of cards with a nonland card among them; "one of them" is the trigger's
// batch, each the object it became in your graveyard, so a card that has left
// since (or was never put there — madness, a replacement) isn't offered. The
// card is exiled face up and may be cast this turn at its usual timing and
// cost (the ruling).
//
// Rulings:
//   - The card exiled by the second ability is exiled face up. Casting it follows the normal rules
//     for casting that card. You must pay its costs, and you must follow all applicable timing
//     rules. For example, if it's a creature card, you can cast it only during your main phase
//     while the stack is empty. In most cases, if you exile a non-instant card during an
//     opponent's turn, you won't be able to cast that turn.
//   - While resolving Conspiracy Theorist's ability, you can't pay {1} and discard a card multiple
//     times to draw more cards.

const ATTACK_TEXT = "Whenever this creature attacks, you may pay {1} and discard a card. If you do, draw a card.";
const DISCARD_TEXT =
  "Whenever you discard one or more nonland cards, you may exile one of them from your graveyard. If you do, you may cast it this turn.";

export default defineCard({
  name: "Conspiracy Theorist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "hand-size", atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Pay {1} and discard a card to draw a card?",
          cost: "{1}",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "discards", who: "you", filter: { notTypes: ["land"] } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        filter: { inSet: "trigger-batch" },
        destination: "exile",
        leftover: "stay",
        mayPlay: { duration: "end-of-turn" },
        prompt: "You may exile one of the discarded cards. If you do, you may cast it this turn.",
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
