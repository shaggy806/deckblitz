import { defineCard } from "../define.js";

// EDHREC rank 25468. "The upkeep of enchanted land's controller" is the upkeep
// of whoever controls the land as that upkeep begins — part of the trigger
// condition (`whileCondition`, rule 603.1), so it isn't asked again as it
// resolves; "that player" is that upkeep's player.

const TEXT = "At the beginning of the upkeep of enchanted land's controller, this Aura deals 1 damage to that player.";

export default defineCard({
  name: "Cursed Land",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${TEXT}`,
  targets: ["land"],
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
