import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 10727.
//
// Rulings:
//   [2022-09-09] Tolarian Terror's first ability can't reduce its cost below {U}.
//   [2022-09-09] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions (such as that of
//     Tolarian Terror). The mana value of the spell is determined by only its mana cost, no
//     matter what the total cost to cast that spell was.
//
// A generic-only reduction, so {U} always remains (Overwhelming Remorse's
// shape: the always-true gate and a count of matching cards in your graveyard).
export default defineCard({
  name: "Tolarian Terror",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  text: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)",
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } },
  },
  triggered: [ward({ mana: "{2}" })],
});
