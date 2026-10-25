import { defineCard } from "../define.js";

// EDHREC rank 20072.
//
// Rulings:
//   [2016-04-08] Kessig Forgemaster's first ability triggers once for each creature blocking or
//     blocked by it. The ability resolves and deals damage to that creature before combat damage
//     is dealt. If that damage destroys a creature blocking Kessig Forgemaster, Kessig Forgemaster
//     doesn't become unblocked.
//   [2016-04-08] Flameheart Werewolf's first ability triggers once for each creature blocking or
//     blocked by it. The ability resolves and deals damage to that creature before combat damage
//     is dealt. If that damage destroys a creature blocking Flameheart Werewolf, Flameheart
//     Werewolf doesn't become unblocked.
//   [2016-04-08] The abilities that transform a Werewolf back and forth look at the entire
//     previous turn, even if the Werewolf with that ability wasn't on the battlefield for some or
//     all of that turn.
//   [2016-04-08] To trigger the Werewolf's back face's transform ability, a single player must
//     have cast two or more spells during the previous turn. If multiple players each cast just
//     one spell during the previous turn, the ability won't trigger.

const BLOCK_TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.";

export default defineCard({
  name: "Kessig Forgemaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman", "Werewolf"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature blocks or becomes blocked by a creature, this creature deals 1 damage to that creature.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: BLOCK_TEXT,
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
  faces: ["Kessig Forgemaster", "Flameheart Werewolf"],
  transform: true,
});
