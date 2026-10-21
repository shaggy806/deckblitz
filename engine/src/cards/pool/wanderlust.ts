import { defineCard } from "../define.js";

// EDHREC rank 29652. "At the beginning of the upkeep of enchanted creature's
// controller" is each upkeep, with "the enchanted creature's controller is the
// active player" as part of the trigger condition (`whileCondition`, rule
// 603.1 — asked only as the step begins, not again on resolution); "that
// player" is the active player.

const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, this Aura deals 1 damage to that player.";

export default defineCard({
  name: "Wanderlust",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
