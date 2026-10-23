import { defineCard } from "../define.js";

// EDHREC rank 24202.
//
// Rulings:
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-04-08] If Lambholt Pacifist's power becomes 4 or greater, it fulfills its own
//     restriction and can attack.

export default defineCard({
  name: "Lambholt Pacifist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Werewolf"],
  power: 3,
  toughness: 3,
  text: "This creature can't attack unless you control a creature with power 4 or greater.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 } },
      restrictions: ["cant-attack"],
      text: "This creature can't attack unless you control a creature with power 4 or greater.",
    },
  ],
  faces: ["Lambholt Pacifist", "Lambholt Butcher"],
  transform: true,
});
