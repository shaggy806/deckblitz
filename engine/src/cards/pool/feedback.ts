import { defineCard } from "../define.js";

// EDHREC rank 28234. "The upkeep of enchanted enchantment's controller" is the
// upkeep of whoever controls it as that upkeep begins — part of the trigger
// condition (`whileCondition`, rule 603.1); "that player" is that upkeep's
// player.

const TEXT =
  "At the beginning of the upkeep of enchanted enchantment's controller, this Aura deals 1 damage to that player.";

export default defineCard({
  name: "Feedback",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant enchantment\n${TEXT}`,
  targets: ["enchantment"],
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
