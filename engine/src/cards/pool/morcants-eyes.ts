import { defineCard } from "../define.js";

// EDHREC rank 9925.
//
// Rulings:
//   [2025-11-17] The value of X is calculated only once, as Morcant's Eyes's last ability
//     resolves. In most cases, Morcant's Eyes will be in your graveyard at that time, so it will
//     count toward the value of X.
//   [2025-11-17] Kindred is a card type that allows noncreature cards to have creature types. For
//     example, Morcant's Eyes is an Elf (although not a creature) while on the battlefield and an
//     Elf card (although not a creature card) in zones other than the battlefield.
//   [2025-11-17] While it appears only on cards that already have other card types, kindred is a
//     card type and will be counted by effects that refer to the number of card types among cards
//     in a zone.
//   [2025-11-17] Some older cards were originally printed with the "tribal" card type. That card
//     type has been replaced with "kindred." This change does not affect the gameplay function of
//     these cards.

export default defineCard({
  name: "Morcant's Eyes",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["kindred", "enchantment"],
  subtypes: ["Elf"],
  text: "At the beginning of your upkeep, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n{4}{G}{G}, Sacrifice this enchantment: Create X 2/2 black and green Elf creature tokens, where X is the number of Elf cards in your graveyard. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false, sacrifice: "self" },
      targets: [],
      // X counted as it resolves — this card, sacrificed for the cost, is
      // an Elf card in your graveyard by then and counts (the first ruling).
      effect: {
        kind: "create-token",
        token: "2/2 Black Green Elf Token",
        count: { countInGraveyard: { subtype: "Elf", ownedBy: "you" } },
      },
      resolve: null,
      text: "{4}{G}{G}, Sacrifice this enchantment: Create X 2/2 black and green Elf creature tokens, where X is the number of Elf cards in your graveyard. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, surveil 1.",
    },
  ],
});
