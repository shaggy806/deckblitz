import { defineCard } from "../define.js";

// EDHREC rank 7000.
//
// Rulings:
//   [2024-06-07] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2024-06-07] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield
//     and an Eldrazi card (although not a creature card) in zones other than the battlefield.
//   [2024-06-07] This cards was originally printed with the "tribal" card type. That card type has
//     been replaced with "kindred". This change does not affect the gameplay function of this
//     card.

export default defineCard({
  name: "Aquitect's Will",
  manaCost: "{U}",
  colors: ["U"],
  types: ["kindred", "sorcery"],
  subtypes: ["Merfolk"],
  text: "Put a flood counter on target land. That land is an Island in addition to its other types for as long as it has a flood counter on it. If you control a Merfolk, draw a card.",
  targets: ["land"],
  // Xolatoyac's flood counter; the draw is checked as the spell resolves.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "flood", amount: 1 },
      { kind: "add-types", target: 0, addSubtypes: ["Island"], duration: { whileCounter: "flood" } },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Merfolk" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
