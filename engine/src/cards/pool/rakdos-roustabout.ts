import { defineCard } from "../define.js";

// EDHREC rank 26404.
//
// Rulings:
//   [2019-01-25] An ability that triggers when a creature becomes blocked triggers only once if two
//     or more creatures block it.

const BLOCKED_TEXT = "Whenever this creature becomes blocked, it deals 1 damage to the player or planeswalker it's attacking.";

// One removed from combat since isn't attacking anything (as Mage Slayer).
export default defineCard({
  name: "Rakdos Roustabout",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 2,
  text: BLOCKED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { attacking: true } },
        then: { kind: "damage", amount: 1, toTriggerRecipient: true },
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
