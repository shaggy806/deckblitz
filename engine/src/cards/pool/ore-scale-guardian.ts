import { defineCard } from "../define.js";

// EDHREC rank 27319.
//
// Overwhelming Remorse's reduction: land cards in your graveyard as the cost is
// determined, generic mana only (never below {R}{R}); the mana value stays 7.

export default defineCard({
  name: "Ore-Scale Guardian",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: "This spell costs {1} less to cast for each land card in your graveyard.\nFlying, haste",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "land" } },
  },
});
