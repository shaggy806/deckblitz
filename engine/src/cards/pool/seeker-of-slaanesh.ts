import { defineCard } from "../define.js";

// EDHREC rank 14801. Warhammer 40,000 Commander.
//
// A requirement on each opponent's declaration, not on each creature: one
// requirement (rule 508.1d), obeyed by any one of their creatures attacking
// anyone. A creature that can't attack (tapped, summoning sick) or would
// have to pay a cost to isn't made to (the ruling); with none able, it asks
// nothing.
const ALLURE_TEXT = "Allure of Slaanesh — Each opponent must attack with at least one creature each combat if able.";

export default defineCard({
  name: "Seeker of Slaanesh",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${ALLURE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      restrictions: [{ kind: "must-attack", atLeastOne: true }],
      text: ALLURE_TEXT,
    },
  ],
});
