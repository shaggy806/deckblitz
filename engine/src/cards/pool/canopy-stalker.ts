import { defineCard } from "../define.js";

// EDHREC rank 24086.
//
// Rulings:
//   [2020-06-23] Canopy Stalker's triggered ability counts itself, as well as any other creatures
//     that die before the triggered ability resolves.
//   [2020-06-23] The defending player, not you, chooses which creature blocks Canopy Stalker.
//   [2020-06-23] Only one creature is required to block Canopy Stalker.
//
// "Each creature that died this turn" is every player's (Grizzly Ghoul's count),
// read as the trigger resolves.

export default defineCard({
  name: "Canopy Stalker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 2,
  text: "This creature must be blocked if able.\nWhen this creature dies, you gain 1 life for each creature that died this turn.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { creaturesDiedThisTurn: true, anyController: true } },
      resolve: null,
      text: "When this creature dies, you gain 1 life for each creature that died this turn.",
    },
  ],
});
