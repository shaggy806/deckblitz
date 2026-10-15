import { defineCard } from "../define.js";

// EDHREC rank 12241.
// Rulings:
//   [2025-06-06] If G'raha Tia and one or more other creatures and/or artifacts you control die at
//     the same time, its last ability will trigger once (as long as it hasn't already triggered
//     this turn).

const EYE_TEXT =
  "The Allagan Eye — Whenever one or more other creatures and/or artifacts you control die, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "G'raha Tia",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Archer"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${EYE_TEXT}`,
  triggered: [
    {
      // Vraan, Executioner Thane's shape: "one or more … die" that triggers
      // only once each turn fires once, for the first deaths of the turn. A
      // leaves-the-battlefield ability looks back (rule 603.10a), so it sees
      // the others when G'raha Tia dies beside them (the ruling).
      trigger: { on: "dies", who: "you-control", filter: { typesAnyOf: ["creature", "artifact"] }, otherOnly: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: EYE_TEXT,
    },
  ],
});
