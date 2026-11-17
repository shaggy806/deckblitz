import { defineCard } from "../define.js";

// EDHREC rank 11912.
//
// Rulings:
//   [2024-04-12] Hollow Marauder's first ability doesn't change its mana value, which is always 7.
//   [2024-04-12] When Hollow Marauder's triggered ability resolves, the next target opponent in
//     turn order (or, if it's a target opponent's turn, that opponent) chooses a card in hand
//     without revealing it, then each other target opponent in turn order (if any) does the same.
//     All chosen cards are then discarded at the same time.
//
// The discards are one instruction (`for-each-target`'s `simultaneous`, Tinybones Joins Up's
// shape). Then each target opponent in turn is asked what they discarded this way: one who
// discarded nothing (an empty hand) or a card of mana value 3 or less draws you a card. A target
// gone illegal is left out (rule 608.2b: what it did can't be determined, so no card for it).

const COST_TEXT = "This spell costs {1} less to cast for each creature card in your graveyard.";
const ENTER_TEXT =
  "When this creature enters, any number of target opponents each discard a card. For each of those opponents who didn't discard a card with mana value 4 or greater, draw a card.";

export default defineCard({
  name: "Hollow Marauder",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter", "Rogue"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `${COST_TEXT}\nFlying\n${ENTER_TEXT}`,
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countInGraveyard: { ownedBy: "you", type: "creature" } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "discard", target: 0, amount: 1 } },
          {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "conditional",
              condition: {
                kind: "this-way",
                what: "discarded",
                who: { target: 0 },
                filter: { manaValue: { op: "gte", n: 4 } },
                atMost: 0,
              },
              then: { kind: "draw", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
