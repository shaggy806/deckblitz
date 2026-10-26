import { defineCard } from "../define.js";

// EDHREC rank 28013.
//
// Rulings:
//   [2017-03-14] Defender only matters when Ogre Jailbreaker could be declared as an attacking
//     creature. If Ogre Jailbreaker is already attacking, losing control of your only Gate won't
//     cause Ogre Jailbreaker to leave combat.
//
// Bristlepack Sentry's shape, read only as attackers are declared.

export default defineCard({
  name: "Ogre Jailbreaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\nThis creature can attack as though it didn't have defender as long as you control a Gate.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 1 },
      canAttackAsThoughNoDefender: true,
      text: "This creature can attack as though it didn't have defender as long as you control a Gate.",
    },
  ],
});
