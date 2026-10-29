import { defineCard } from "../define.js";

// EDHREC rank 8839.
//
// Rulings:
//   [2018-07-13] When Fraying Omnipotence resolves, first each player loses the appropriate amount
//     of life at once. Next, the player whose turn it is chooses an appropriate number of cards in
//     hand without revealing them, then each other player in turn order does the same, and then
//     those cards are all discarded simultaneously. Then, the player whose turn it is chooses an
//     appropriate number of creatures they control. Each other player in turn order does the same,
//     knowing choices made by previous players. Finally, all of the chosen creatures are
//     sacrificed simultaneously.
//   [2018-07-13] The amounts that are lost are rounded up, not the amounts kept.
//
// Each half is read from each player's own side as that step is done.

export default defineCard({
  name: "Fraying Omnipotence",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses half their life, then discards half the cards in their hand, then sacrifices half the creatures they control of their choice. Round up each time.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", who: "each-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      { kind: "discard", target: "each-player", amount: { half: { cardsInHand: "each" }, round: "up" } },
      {
        kind: "sacrifice",
        who: "each-player",
        filter: { type: "creature" },
        count: {
          half: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
          round: "up",
        },
      },
    ],
  },
});
