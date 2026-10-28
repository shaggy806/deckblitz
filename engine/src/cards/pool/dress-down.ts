import { defineCard } from "../define.js";

// EDHREC rank 4019.
//
// Humility's loss without the P/T (`loseAllAbilities`).
//
// Rulings:
//   [2021-06-18] If an effect grants a creature an ability after Dress Down has entered the
//     battlefield, it won't lose that ability. For example, if a land becomes a creature while
//     Dress Down is on the battlefield, it will still gain any abilities given to it by the effect
//     that animated it. It will, however, lose any abilities it already had.
//   [2021-06-18] If an effect causes Dress Down to become a creature, it will lose its own
//     abilities along with all other creatures. This includes the triggered ability that causes it
//     to be sacrificed at the beginning of the end step.

export default defineCard({
  name: "Dress Down",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: "Flash\nWhen this enchantment enters, draw a card.\nCreatures lose all abilities.\nAt the beginning of the end step, sacrifice this enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this enchantment enters, draw a card.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "At the beginning of the end step, sacrifice this enchantment.",
    },
  ],
  static: [
    {
      affects: { scope: "all-creatures" },
      loseAllAbilities: true,
      text: "Creatures lose all abilities.",
    },
  ],
});
