import { defineCard } from "../define.js";

// EDHREC rank 16887.

export default defineCard({
  name: "Form of the Dragon",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, this enchantment deals 5 damage to any target.\nAt the beginning of each end step, your life total becomes 5.\nCreatures without flying can't attack you.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "At the beginning of your upkeep, this enchantment deals 5 damage to any target.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: 5 },
      resolve: null,
      text: "At the beginning of each end step, your life total becomes 5.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", notKeyword: "flying" } },
      restrictions: [{ kind: "cant-attack", at: "you" }],
      text: "Creatures without flying can't attack you.",
    },
  ],
});
