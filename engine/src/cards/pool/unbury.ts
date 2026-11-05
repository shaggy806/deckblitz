import { defineCard } from "../define.js";

// EDHREC rank 8308.
//
// Rulings:
//   [2023-02-04] If you choose the second mode, the cards must share at least one creature type,
//     such as Faerie or Goblin.
//   [2023-02-04] If you choose the second mode and one of the two cards leaves your graveyard,
//     you'll still return the other card to your hand as long as it has a creature type that the
//     other card had as it left your graveyard.
//
// Return from Extinction's shape, at instant speed.
export default defineCard({
  name: "Unbury",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Return target creature card from your graveyard to your hand.\n• Return two target creature cards that share a creature type from your graveyard to your hand.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Return two target creature cards that share a creature type from your graveyard to your hand.",
        targets: [
          { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          {
            kind: "other",
            of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
            than: { slots: [0] },
            shares: { kind: "creature" },
          },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
    ],
  },
});
