import { defineCard } from "../define.js";

// The back face of Torrent Sculptor // Flamethrower Sonata.
//
// Rulings:
//   [2021-04-16] If you have no cards in hand as Flamethrower Sonata resolves, you won't be able
//     to discard a card, but you will draw a card. No damage will be dealt.
//   [2021-04-16] Flamethrower Sonata goes on the stack without a target. ... When you discard an
//     instant or sorcery card this way, the reflexive triggered ability triggers and you pick a
//     target to be dealt damage.
//
// Fiery Encore's shape: the reflexive trigger is put on the stack once the
// spell has finished resolving (rule 603.3), after the draw.
export default defineCard({
  name: "Flamethrower Sonata",
  art: "https://cards.scryfall.io/art_crop/back/8/7/87463b68-3642-41c7-a11c-67d524759b60.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Discard a card, then draw a card. When you discard an instant or sorcery card this way, Flamethrower Sonata deals damage equal to that card's mana value to target creature or planeswalker you don't control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", filter: { typesAnyOf: ["instant", "sorcery"] } },
        then: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "permanent",
              whose: "opponent",
              filter: { typesAnyOf: ["creature", "planeswalker"] },
            },
          ],
          value: { thisWay: "discarded", sumOf: "mana-value" },
          effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
          text: "When you discard an instant or sorcery card this way, Flamethrower Sonata deals damage equal to that card's mana value to target creature or planeswalker you don't control.",
        },
      },
      { kind: "draw", amount: 1 },
    ],
  },
  faces: ["Torrent Sculptor", "Flamethrower Sonata"],
});
