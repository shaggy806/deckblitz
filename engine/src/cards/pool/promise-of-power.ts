import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 12909.
//
// Rulings: the Demon's P/T are set as the spell resolves; entwined, you draw
// five and lose 5 life first, and the drawn cards count toward X (the modes
// resolve in printed order).

export default defineCard({
  name: "Promise of Power",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{4}", keyword: "entwine" },
  text: "Choose one —\n• You draw five cards and you lose 5 life.\n• Create an X/X black Demon creature token with flying, where X is the number of cards in your hand.\nEntwine {4} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "You draw five cards and you lose 5 life.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 5 },
            { kind: "lose-life", amount: 5 },
          ],
        },
      },
      {
        text: "Create an X/X black Demon creature token with flying, where X is the number of cards in your hand.",
        targets: [],
        effect: {
          kind: "create-token",
          token: "X/X Demon Token (Flying)",
          count: 1,
          basePt: { power: { cardsInHand: "you" }, toughness: { cardsInHand: "you" } },
        },
      },
    ],
    kickedModes: 2,
  },
});
