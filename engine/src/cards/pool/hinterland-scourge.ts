import { defineCard } from "../define.js";

// Hinterland Hermit's back face.
//
// Rulings:
//   [2011-01-22] If Hinterland Scourge is attacking, the defending player must assign at least one
//     blocker to it during the declare blockers step if that player controls any creatures that
//     could block it.

export default defineCard({
  name: "Hinterland Scourge",
  art: "https://cards.scryfall.io/art_crop/back/b/6/b6edac85-78e7-4e90-b538-b67c88bb5c62.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 2,
  text: "This creature must be blocked if able.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Hinterland Hermit", "Hinterland Scourge"],
  transform: true,
});
