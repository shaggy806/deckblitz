import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 20799.
//
// Rulings:
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.

export default defineCard({
  name: "Thieves' Fortune",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["kindred", "instant"],
  subtypes: ["Rogue"],
  text: "Prowl {U} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)\nLook at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
  alternativeCost: prowl("{U}"),
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "bottom-any-order",
  },
});
