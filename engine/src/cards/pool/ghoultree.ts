import { defineCard } from "../define.js";

// EDHREC rank 10994.
//
// Rulings:
//   [2025-01-24] Ghoultree’s ability can’t reduce the total cost to cast the spell below {G}.
//   [2025-01-24] Once you begin to cast Ghoultree, no player may take actions until you’re done.
//
// Overwhelming Remorse's reduction: generic mana only, so never below {G}.

export default defineCard({
  name: "Ghoultree",
  manaCost: "{7}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Zombie", "Treefolk"],
  power: 10,
  toughness: 10,
  text: "This spell costs {1} less to cast for each creature card in your graveyard.",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
});
