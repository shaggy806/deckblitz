import { defineCard } from "../define.js";

// EDHREC rank 10909.
//
// Rulings:
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2025-01-24] If you control three Vildin-Pack Alphas and a Werewolf enters the battlefield
//     under your control, you may transform it, transform it again, and transform it a third time.
//   [2025-01-24] If a creature with haste transforms and no longer has haste on the same turn that
//     it comes under your control, such as if you cast a Geier Reach Bandit when you already
//     control a Vildin-Pack Alpha and choose to transform it, it won’t be able to attack that
//     turn.

export default defineCard({
  name: "Geier Reach Bandit",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Werewolf"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
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
  faces: ["Geier Reach Bandit", "Vildin-Pack Alpha"],
  transform: true,
});
