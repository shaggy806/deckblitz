import { defineCard } from "../define.js";

// EDHREC rank 13283.
//
// Rulings:
//   [2025-02-07] If a card in your graveyard is an artifact creature card, count it only once when
//     determining the cost reduction for this card’s first ability.
//   [2025-02-07] This card’s first ability can’t reduce colored mana in its cost, so the cost
//     can’t be reduced below {B} this way.
//
// Karador's graveyard count, over `typesAnyOf` (each card once, the first
// ruling); `reduceGeneric` only ever takes generic mana (the second).

export default defineCard({
  name: "Chitin Gravestalker",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 5,
  toughness: 4,
  cycling: { cost: "{2}" },
  text: "This spell costs {1} less to cast for each artifact and/or creature card in your graveyard.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["artifact", "creature"] } },
  },
});
