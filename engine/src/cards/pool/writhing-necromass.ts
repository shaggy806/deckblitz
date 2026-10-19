import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 16510.
//
// Overwhelming Remorse's reduction: creature cards in your graveyard as the
// cost is determined, generic mana only — never below {B} (the ruling) — and
// the mana value stays 7.
export default defineCard({
  name: "Writhing Necromass",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 5,
  toughness: 5,
  keywords: ["deathtouch"],
  text: "This spell costs {1} less to cast for each creature card in your graveyard.\nDeathtouch",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
});
