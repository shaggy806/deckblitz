import { defineCard } from "../define.js";

// EDHREC rank 12314.
//
// Rulings:
//   [2016-04-08] The first ability of Lone Wolf of the Natterknolls will resolve even if the spell
//     your opponent casts is countered.
//   [2016-04-08] You may cast spells or activate abilities after the first ability of Hermit of
//     the Natterknolls has resolved but before the spell that caused it to trigger has resolved.
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.
//   [2016-04-08] You may cast spells or activate abilities after the first ability of Lone Wolf of
//     the Natterknolls has resolved but before the spell that caused it to trigger has resolved.
//   [2016-04-08] The first ability of Hermit of the Natterknolls will resolve even if the spell
//     your opponent casts is countered.

export default defineCard({
  name: "Hermit of the Natterknolls",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 3,
  text: "Whenever an opponent casts a spell during your turn, draw a card.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever an opponent casts a spell during your turn, draw a card.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", none: true },
    },
  ],
  faces: ["Hermit of the Natterknolls", "Lone Wolf of the Natterknolls"],
  transform: true,
});
