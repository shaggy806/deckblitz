import { defineCard } from "../define.js";

// EDHREC rank 15467.
//
// Rulings:
//   [2025-11-14] Serpent of the Pass's second ability cannot reduce the {U}{U} in its cost.
//
// The conditional flash is `flashIf` (Swift Reckoning's graveyard count); the
// reduction comes off the generic part only (`reduceGeneric`), counted as
// it's cast (Overwhelming Remorse's always-true gate).
export default defineCard({
  name: "Serpent of the Pass",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 5,
  flashIf: { condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { subtype: "Lesson" } } },
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countInGraveyard: { ownedBy: "you", notTypes: ["creature", "land"] } },
  },
  text: "If there are three or more Lesson cards in your graveyard, you may cast this spell as though it had flash.\nThis spell costs {1} less to cast for each noncreature, nonland card in your graveyard.",
});
