import { defineCard } from "../define.js";

// EDHREC rank 24749.
//
// Rulings:
//   [2022-09-09] Casting an instant or sorcery spell after Haunting Figment has become blocked
//     will not cause it to become unblocked.

const UNBLOCKABLE_TEXT = "This creature can't be blocked as long as you've cast an instant or sorcery spell this turn.";

export default defineCard({
  name: "Haunting Figment",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${UNBLOCKABLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
