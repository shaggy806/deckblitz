import { defineCard } from "../define.js";

// EDHREC rank 13252.
//
// Rulings:
//   [2011-09-22] If a player controls no creatures, or each creature they control is a Zombie,
//     that player does nothing when the first ability resolves.
//   [2011-09-22] If there is at least one creature on the battlefield at the beginning of the end
//     step, the last ability won't trigger. If it does trigger, but a creature enters before it
//     resolves, the ability won't do anything when it resolves.

export default defineCard({
  name: "Call to the Grave",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "At the beginning of each player's upkeep, that player sacrifices a non-Zombie creature of their choice.\nAt the beginning of the end step, if no creatures are on the battlefield, sacrifice this enchantment.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "active-player",
        filter: { type: "creature", notSubtypes: ["Zombie"] },
        count: 1,
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player sacrifices a non-Zombie creature of their choice.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      // An intervening-if (rule 603.4): checked as it triggers and again as it resolves.
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 1 } },
          { kind: "not", of: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 1 } },
        ],
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, if no creatures are on the battlefield, sacrifice this enchantment.",
    },
  ],
});
