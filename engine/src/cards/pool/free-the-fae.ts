import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Adventurer cards aren't instant or sorcery cards while they're in your graveyard.
//     You can't use Free the Fae to put an adventurer card milled with it into your hand unless
//     that card is a Faerie.
// The put is mandatory when a milled card qualifies (Speak Secrets' shape, `min: 1`); a card in
// the graveyard is read by its main characteristics, so an adventurer counts only as a Faerie.

export default defineCard({
  name: "Free the Fae",
  art: "https://cards.scryfall.io/art_crop/back/5/e/5ebac73a-1ecf-4e6d-87b1-ea560bfeb064.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Mill four cards. Then put an instant, sorcery, or Faerie card from among the milled cards into your hand.",
  faces: ["Picklock Prankster", "Free the Fae"],
  adventure: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { thisWay: "milled", anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Faerie" }] },
      },
    ],
  },
});
