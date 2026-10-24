import { defineCard } from "../define.js";

// EDHREC rank 5983.
//
// Rulings:
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.
//   [2016-04-08] You can activate Duskwatch Recruiter's first ability in response to its triggered
//     ability.
//   [2016-04-08] Krallenhorde Howler's first ability can only reduce the generic mana portion of a
//     creature spell's cost.
//   [2016-04-08] Krallenhorde Howler's first ability can reduce alternative costs such as madness
//     costs.

export default defineCard({
  name: "Duskwatch Recruiter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Werewolf"],
  power: 2,
  toughness: 2,
  text: "{2}{G}: Look at the top three cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: "{2}{G}: Look at the top three cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    },
  ],
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
  faces: ["Duskwatch Recruiter", "Krallenhorde Howler"],
  transform: true,
});
