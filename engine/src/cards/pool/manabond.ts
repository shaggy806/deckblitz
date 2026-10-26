import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] You discard all the cards still in your hand after you put the lands onto the
//     battlefield.
//   [2004-10-04] The lands are put onto the battlefield during the resolution of the ability.
//   [2004-10-04] Putting a land onto the battlefield does not count as playing a land.
//
// "Reveal your hand": every card in it then goes somewhere public in the same resolution (the
// lands to the battlefield, the rest discarded), so the reveal shows nothing the next step
// doesn't. Every land card is put (min = max = the hand, clamped to the land cards).

const TEXT =
  "At the beginning of your end step, you may reveal your hand and put all land cards from it onto the battlefield. If you do, discard your hand.";

export default defineCard({
  name: "Manabond",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal your hand, put all land cards from it onto the battlefield, then discard your hand?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "hand",
              min: { cardsInHand: "you" },
              max: { cardsInHand: "you" },
              filter: { type: "land" },
              destination: "battlefield",
              leftover: "stay",
            },
            { kind: "discard-hand", who: "you" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
