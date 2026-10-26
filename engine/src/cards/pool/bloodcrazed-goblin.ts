import { defineCard } from "../define.js";

// Rulings:
//   [2010-08-15] For Bloodcrazed Goblin to be able to attack, an opponent must have been dealt
//     damage that turn before the declare attackers step begins. ...
//   [2010-08-15] It checks only whether damage was dealt to an opponent, not life totals.
//   [2010-08-15] It doesn’t matter how an opponent was dealt damage, or even who controlled the
//     source of the damage.
//   [2010-08-15] If damage would have been dealt to an opponent but it was all prevented,
//     redirected, or otherwise replaced, Bloodcrazed Goblin won’t be able to attack.
// `"damage-taken"` counts damage dealt (after prevention) to the player this turn, from any
// source; `who: "opponent"` holds when some one opponent has taken at least 1.

const TEXT = "This creature can't attack unless an opponent has been dealt damage this turn.";

export default defineCard({
  name: "Bloodcrazed Goblin",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 } },
      text: TEXT,
    },
  ],
});
