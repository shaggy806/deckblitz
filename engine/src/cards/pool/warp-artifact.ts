import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 29266.
//
// "The upkeep of enchanted artifact's controller" is part of the trigger
// condition (rule 603.1): it fires at each upkeep, but only while the
// artifact this Aura enchants is controlled by the player whose upkeep it is
// (`whileCondition`); "that player" is that active player.
const TEXT = "At the beginning of the upkeep of enchanted artifact's controller, this Aura deals 1 damage to that player.";

export default defineCard({
  name: "Warp Artifact",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
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
