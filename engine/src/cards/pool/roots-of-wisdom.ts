import { defineCard } from "../define.js";

// EDHREC rank 14494. Kaldheim.
//
// Rulings:
//   [2021-02-05] If there’s a land card or Elf card in your graveyard, you must return one. You
//     can’t choose not to in order to draw a card.
//   [2021-02-05] Roots of Wisdom doesn’t target any cards in graveyards. You may return a land
//     card or an Elf card that was just milled or one that was already there.

const LAND_OR_ELF = { anyOf: [{ type: "land" as const }, { subtype: "Elf" }] };

export default defineCard({
  name: "Roots of Wisdom",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Mill three cards, then return a land card or Elf card from your graveyard to your hand. If you can't, draw a card. (To mill a card, put the top card of your library into your graveyard.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 1, filter: LAND_OR_ELF },
        then: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
          filter: LAND_OR_ELF,
        },
        else: { kind: "draw", amount: 1 },
      },
    ],
  },
});
