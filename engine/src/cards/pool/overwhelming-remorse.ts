import { defineCard } from "../define.js";

// EDHREC rank 7577.
//
// Rulings:
//   [2022-10-14] Overwhelming Remorse's first ability can't reduce its cost to less than {B}.
//   [2022-10-14] Overwhelming Remorse's first ability doesn't change its mana cost or mana value.
//     It just reduces the cost to cast the spell.
//
// Karador, Ghost Chieftain's reduction: creature cards in your graveyard as
// the cost is determined, generic mana only (so never below {B}, the first
// ruling), and the card's mana value stays 5 (the second).

export default defineCard({
  name: "Overwhelming Remorse",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {1} less to cast for each creature card in your graveyard.\nExile target creature or planeswalker.",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "exile", target: 0 },
});
