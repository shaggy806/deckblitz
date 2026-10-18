import { defineCard } from "../define.js";

// EDHREC rank 10252.
// Rulings:
//   You may discard to keep it even with no legal target for the second
//   ability; that one then just doesn't go on the stack.
//   The target is chosen only as the reflexive ability goes on the stack
//   ("When you discard a card this way" — rule 603.12), knowing the discarded
//   card's mana value; players may respond to it.
// "Sacrifice unless you discard" is the controller's own choice: a `may` to
// discard, and with nothing discarded (declined, or an empty hand) the
// sacrifice. Narset of the Ancient Way's discard-then-reflexive shape.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you discard a card. When you discard a card this way, destroy target nonland permanent an opponent controls with mana value less than or equal to the mana value of the discarded card.";

export default defineCard({
  name: "Argentum Masticore",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Masticore"],
  power: 5,
  toughness: 5,
  keywords: ["first-strike"],
  text: `First strike, protection from multicolored\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to keep Argentum Masticore? (Otherwise sacrifice it.)",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  {
                    kind: "permanent",
                    whose: "opponent",
                    filter: {
                      notTypes: ["land"],
                      // Bound as the reflexive ability is created, in this
                      // resolution, which knows the card discarded this way.
                      manaValue: { op: "lte", n: { amount: { thisWay: "discarded", sumOf: "mana-value" } } },
                    },
                  },
                ],
                effect: { kind: "destroy", target: 0 },
                text: "When you discard a card this way, destroy target nonland permanent an opponent controls with mana value less than or equal to the mana value of the discarded card.",
              },
              else: { kind: "sacrifice-source" },
            },
          ],
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { multicolored: true } },
      text: "Protection from multicolored",
    },
  ],
});
