import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 27025.
//
// Rulings:
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.

export default defineCard({
  name: "Morsel Theft",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Rogue"],
  text: "Prowl {1}{B} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)\nTarget player loses 3 life and you gain 3 life. If this spell's prowl cost was paid, draw a card.",
  alternativeCost: prowl("{1}{B}"),
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 3, target: 0 },
      { kind: "gain-life", amount: 3 },
      { kind: "conditional", condition: { kind: "self-prowl-paid" }, then: { kind: "draw", amount: 1 } },
    ],
  },
});
