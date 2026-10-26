import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 29805.
//
// Maddening Wind's damage trigger: each upkeep, with "the enchanted
// creature's controller is the active player" part of the trigger
// condition; "that player" is the active player.

const DAMAGE_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, this Aura deals 2 damage to that player.";

export default defineCard({
  name: "Parasitic Bond",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${DAMAGE_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
